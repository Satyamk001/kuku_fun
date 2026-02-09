'use client';

import { apiGetRaw, createBrowserApiClient } from '@/lib/api-client';
import { ChatUser, DirectMessage, mapDirectMessage, mapDirectMessagesResponse, PaginatedMessagesResponse, RawDirectMessage } from '@/types/chat';
import { useAuth } from '@clerk/nextjs';
import { ChangeEvent, KeyboardEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { type Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Send, Wifi, WifiOff, FileIcon, Download, FileText } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import ImageUploadButton from './image-upload-button';
import { ImageModal } from '../ui/image-modal';

type DirectChatPanelProps = {
  otherUserId: number;
  otherUser: ChatUser | null;
  socket: Socket | null;
  connected: boolean;
  isOtherUserOnline: boolean;
  onBack: () => void;
};

function DirectChatPanel(props: DirectChatPanelProps) {
  const { otherUser, otherUserId, socket, connected, isOtherUserOnline, onBack } = props;
  const { getToken } = useAuth();

  const apiClient = useMemo(() => createBrowserApiClient(getToken), [getToken]);

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typingLabel, setTypingLabel] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const lastScrollTopRef = useRef(0);
  const scrollSnapshotRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);

  // Auto-scroll to bottom on initial load handled in useLayoutEffect now

  // Reset state when switching conversations
  useEffect(() => {
    setMessages([]);
    setPageNo(1);
    setHasMore(true);
    hasMoreRef.current = true;
    isInitialLoadRef.current = true;
    loadingRef.current = false;
    lastScrollTopRef.current = 0;
  }, [otherUserId]);

  // Load messages
  useEffect(() => {
    let isMounted = true;

    async function load() {
      // Guard: Don't load if already loading or no more messages
      if (loadingRef.current) {
        return;
      }
      
      if (pageNo > 1 && !hasMore) {
        return;
      }

      loadingRef.current = true;
      setIsLoading(true);

      try {
        const res = await apiGetRaw<unknown>(apiClient, `/api/chat/conversations/${otherUserId}/messages`, {
          params: {
            limit: 20,
            page: pageNo
          }
        });

        if (!isMounted) return;
        
        const { data: newMessages, hasMore: responseHasMore } = mapDirectMessagesResponse(res);
        
        // Store scroll position before adding messages (for pagination)
        const container = messagesContainerRef.current;
        if (container && pageNo > 1) {
          scrollSnapshotRef.current = {
            scrollHeight: container.scrollHeight,
            scrollTop: container.scrollTop
          };
        }
        
        setMessages((prev) => {
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));
          return [...uniqueNewMessages, ...prev];
        });
        
        setHasMore(responseHasMore);
        hasMoreRef.current = responseHasMore;
      } catch (err) {
        console.log(err);
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
      }
    }

    if (otherUserId) {
      load();
    }

    return () => {
      isMounted = false;
      loadingRef.current = false;
    };
  }, [otherUserId, pageNo]);

  // Restore scroll position immediately after render but before paint
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Case 1: Initial Load -> Scroll to bottom
    if (isInitialLoadRef.current && messages.length > 0) {
      // Use smooth behavior for better UX if preferred, or auto for instant
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      isInitialLoadRef.current = false;
      return;
    }

    // Case 2: Pagination -> Restore scroll position
    if (scrollSnapshotRef.current) {
      const { scrollHeight: prevScrollHeight, scrollTop: prevScrollTop } = scrollSnapshotRef.current;
      const newScrollHeight = container.scrollHeight;
      
      // Calculate new scroll position to keep focus on the same content
      const scrollDiff = newScrollHeight - prevScrollHeight;
      container.scrollTop = prevScrollTop + scrollDiff;
      
      // Reset snapshot
      scrollSnapshotRef.current = null;
    }
  }, [messages]);

  // Socket message handling
  useEffect(() => {
    if (!socket) return;

    function handleMessage(payload: RawDirectMessage) {
      const mapped = mapDirectMessage(payload);

      if (mapped.senderUserId !== otherUserId && mapped.recipientUserId !== otherUserId) {
        return;
      }

      setMessages(prev => [...prev, mapped]);
      
      // Auto-scroll to bottom for new messages
      setTimeout(() => {
        messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    function handleTyping(payload: { senderUserId?: number; receipientUserId?: number; isTyping?: boolean }) {
      const senderId = Number(payload.senderUserId);

      if (senderId !== otherUserId) return;

      if (payload.isTyping) {
        setTypingLabel('Typing...');
      } else {
        setTypingLabel(null);
      }
    }

    socket.on('dm:message', handleMessage);
    socket.on('dm:typing', handleTyping);

    return () => {
      socket.off('dm:message', handleMessage);
      socket.off('dm:typing', handleTyping);
    };
  }, [socket, otherUserId]);

  // Scroll-based pagination: Load more when scrolling near the top
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      const isScrollingUp = currentScrollTop < lastScrollTopRef.current;
      lastScrollTopRef.current = currentScrollTop;

      // Trigger load when within 100px of the top AND scrolling up
      // Use refs to check latest state without dependencies
      if (currentScrollTop < 100 && isScrollingUp && !loadingRef.current && hasMoreRef.current) {
        setPageNo(prev => prev + 1);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  function setSendTyping(isTyping: boolean) {
    if (!socket) {
      return;
    }

    socket.emit('dm:typing', { recipientUserId: otherUserId, isTyping });
  }

  function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const value = event.target.value;
    
    // Limit to 500 characters
    if (value.length > 500) {
      return;
    }

    setInput(value);

    if (!socket) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setSendTyping(true);

    typingTimeoutRef.current = setTimeout(() => {
      setSendTyping(false);
      typingTimeoutRef.current = null;
    }, 2000);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  async function handleSend() {
    if (!socket || !connected) {
      toast('Not connected', {
        description: 'Realtime connection is not established yet!'
      });

      return;
    }

    const body = input.trim();

    if (!body && !imageUrl) return;

    setSending(true);

    try {
      socket.emit('dm:send', {
        recipientUserId: otherUserId,
        body: body || null,
        imageUrl: imageUrl || null
      });

      setInput('');
      setImageUrl('');
      setSendTyping(false);
    } finally {
      setSending(false);
    }
  }

  const title =
    otherUser?.handle && otherUser?.handle !== ''
      ? `@${otherUser?.handle}`
      : (otherUser?.displayName ?? 'Conversation');

  function isImage(url: string) {
    if (!url) return false;
    // Strictly check for browser-supported image extensions
    return /\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i.test(url);
  }

  function getFileName(url: string) {
    return url.split('/').pop() || 'File';
  }

  function getFileIcon(url: string, className = "h-5 w-5") {
    if (/\.pdf$/i.test(url)) return <FileText className={`${className} text-red-500`} />;
    if (/\.(doc|docx)$/i.test(url)) return <FileText className={`${className} text-blue-500`} />;
    if (/\.(txt|md)$/i.test(url)) return <FileText className={`${className} text-stone-500`} />;
    return <FileIcon className={`${className} text-primary`} />;
  }

  // Drag and drop handlers
  const [isDragging, setIsDragging] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    await uploadFile(file);
  }

  async function uploadFile(file: File) {
     try {
      const formData = new FormData();
      formData.append('file', file);

      toast('Uploading file...');

      const res = await apiClient.post('/api/upload/image-upload', formData);
      const url: string | undefined = res.data?.url;

      if (!url) {
        throw new Error('No url is found');
      }

      setImageUrl(url);
      toast.success('File attached');
    } catch (e) {
      console.log(e);
      toast.error('Upload failed');
    }
  }


  async function handleRemoveAttachment() {
    if (!imageUrl) return;

    const urlToDelete = imageUrl;
    setImageUrl(null); // Optimistic update

    try {
      // Determine resource type based on URL structure (Cloudinary specific)
      // If it contains '/raw/', it's a raw file. Otherwise treat as 'image' (which covers 'auto' -> 'image'/pdf).
      const resourceType = urlToDelete.includes('/raw/') ? 'raw' : 'image';

      await apiClient.post('/api/upload/delete', {
        url: urlToDelete,
        resourceType: resourceType
      });
    } catch (err) {
      console.error('Failed to delete file from cloud', err);
      // We don't necessarily need to revert UI for this, just log it
    }
  }

  return (
    <>
    <Card className="flex h-full max-h-[calc(100vh-8rem)] flex-col overflow-hidden border-border/70 bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 -ml-2" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-base text-foreground">{title}</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">Direct message conversation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span
             className={`flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium ${
               isOtherUserOnline ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'
             }`}
           >
             {isOtherUserOnline ? (
               <>
                 <Wifi className="w-3 h-3" />
                 Online
               </>
             ) : (
               <>
                 <WifiOff className="w-3 h-3" />
                 Offline
               </>
             )}
           </span>
         </div>
      </CardHeader>

      <CardContent 
        ref={messagesContainerRef}
        className="flex-1 space-y-3 overflow-y-auto overflow-x-hidden bg-background/60 p-4 max-h-[calc(100vh-20rem)] md:max-h-[calc(100vh-16rem)] scroll-smooth scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200 border-2 border-dashed border-primary m-4 rounded-xl">
            <div className="text-center">
               <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                 <Download className="h-8 w-8 text-primary animate-bounce" />
               </div>
               <h3 className="text-lg font-semibold">Drop file to upload</h3>
            </div>
          </div>
        )}

        {isLoading && pageNo === 1 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-muted-foreground">Loading messages...</p>
          </div>
        )}
        {isLoading && pageNo > 1 && (
          <div className="flex items-center justify-center py-4">
            <p className="text-xs text-muted-foreground">Loading older messages...</p>
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-xs text-muted-foreground">No messages yet. Start the first initiative</p>
          </div>
        )}

        {messages.map((msg, index) => {
            const isOther = msg.senderUserId === otherUserId;
            const label = isOther ? title : 'You';

            const time = new Date(msg.createdAt).toLocaleDateString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div 
                className={`flex gap-2 text-xs min-w-0 ${isOther ? 'justify-start' : 'justify-end'}`} 
                key={msg.id}
              >
                <div className={`min-w-0 max-w-[85%] sm:max-w-md md:max-w-lg ${isOther ? '' : 'order-2'}`}>
                  <div
                    className={`mb-1 text-[12px] font-medium ${
                      isOther ? 'text-muted-foreground' : 'text-muted-foreground text-right'
                    }`}
                  >
                    {label} - {time}
                  </div>

                  {msg?.body && (
                    <div
                      className={`inline-block rounded-lg px-3 py-2 transition-colors duration-150 overflow-hidden max-w-full
                      ${isOther ? 'bg-accent text-accent-foreground' : 'bg-primary/80 text-primary-foreground'}
                      `}
                    >
                      <p className="break-all text-sm sm:text-base leading-relaxed">
                        {expandedMessages.has(msg.id) || msg.body.length <= 100
                          ? msg.body
                          : `${msg.body.substring(0, 100)}...`}
                        {msg.body.length > 100 && (
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedMessages);
                              if (expandedMessages.has(msg.id)) {
                                newExpanded.delete(msg.id);
                              } else {
                                newExpanded.add(msg.id);
                              }
                              setExpandedMessages(newExpanded);
                            }}
                            className="ml-2 text-xs underline opacity-80 hover:opacity-100"
                          >
                            {expandedMessages.has(msg.id) ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </p>
                    </div>
                  )}

                  {msg?.imageUrl && (
                    <div className="mt-2 text-left">
                      {isImage(msg.imageUrl) ? (
                        <div 
                          className="overflow-hidden rounded-lg border border-border cursor-pointer transition-opacity hover:opacity-90 max-w-[200px]"
                          onClick={() => setSelectedImage(msg.imageUrl)}
                        >
                          <img 
                            src={msg.imageUrl} 
                            alt="attachment" 
                            className="max-h-40 w-full object-cover" 
                          />
                        </div>
                      ) : (
                        <a 
                          href={msg.imageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 ${
                            isOther ? 'bg-card' : 'bg-primary/5'
                          }`}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            {getFileIcon(msg.imageUrl, "h-5 w-5")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium text-foreground">{getFileName(msg.imageUrl)}</p>
                            <p className="text-[10px] text-muted-foreground">Click to download</p>
                          </div>
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {typingLabel && (
          <div className="flex justify-start gap-2 text-xs">
            <div className="italic text-muted-foreground">{typingLabel}</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 bg-background border-t border-border">
          {/* Attachment Preview - Compact */}
          {imageUrl && (
            <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-muted/50 p-2 w-fit max-w-full">
              {isImage(imageUrl) ? (
                 <img src={imageUrl} alt="Attachment preview" className="h-10 w-10 rounded object-cover border border-border" />
              ) : (
                 <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 border border-border">
                    {getFileIcon(imageUrl, "h-5 w-5")}
                 </div>
              )}
              <div className="flex-1 min-w-0 px-1">
                 <p className="text-xs font-medium truncate max-w-[150px]">{getFileName(imageUrl)}</p>
              </div>
              <button 
                onClick={handleRemoveAttachment} 
                className="ml-2 rounded-full p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Remove attachment"
              >
                  <span className="sr-only">Remove</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <ImageUploadButton onImageUpload={url => setImageUrl(url)} />
            
            <div className="relative flex-1">
              <Textarea
                rows={1}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={!connected || sending}
                className="min-h-[44px] max-h-32 py-3 px-4 resize-none border-border bg-background text-sm w-full focus-visible:ring-1"
                style={{ height: 'auto', minHeight: '44px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
              />
            </div>
            
            <Button 
                size="icon" 
                className="h-[44px] w-[44px] shrink-0" 
                onClick={handleSend} 
                disabled={sending || !connected || (!input.trim() && !imageUrl)}
            >
                <Send className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex justify-between items-center px-1 mt-1">
            <span className={`text-[10px] ${input.length > 450 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {input.length}/500 characters
            </span>
          </div>
      </div>
    </Card>

    <ImageModal 
      isOpen={!!selectedImage} 
      src={selectedImage} 
      onClose={() => setSelectedImage(null)} 
    />
    </>
  );
}

export default DirectChatPanel;