'use client';

import { apiGetRaw, createBrowserApiClient } from '@/lib/api-client';
import { ChatUser, DirectMessage, mapDirectMessage, mapDirectMessagesResponse, PaginatedMessagesResponse, RawDirectMessage } from '@/types/chat';
import { useAuth } from '@clerk/nextjs';
import { ChangeEvent, KeyboardEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { type Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Send, Wifi, WifiOff, FileIcon, Download, FileText, X } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import ImageUploadButton from './image-upload-button';
import { ImageModal } from '../ui/image-modal';
import { ChatMessage } from './chat-message';
import TypingIndicator from './typing-indicator';

type DirectChatPanelProps = {
  otherUserId: number;
  otherUser: ChatUser | null;
  socket: Socket | null;
  connected: boolean;
  isOtherUserOnline: boolean;
  onBack: () => void;
};

function formatLastSeen(dateStr: string | null) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return `Last seen today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return `Last seen ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

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

  // Read Receipts - Emit Read
  useEffect(() => {
    if (!socket || !connected || messages.length === 0) return;

    const unreadMessageIds = messages
      .filter(m => m.senderUserId === otherUserId && m.status !== 'read')
      .map(m => m.id);

    if (unreadMessageIds.length > 0) {
       socket.emit('dm:read', { messageIds: unreadMessageIds, senderUserId: otherUserId });
    }
  }, [messages, socket, connected, otherUserId]);

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
        setTypingLabel('typing...');
      } else {
        setTypingLabel(null);
      }
    }
    
    function handleStatusUpdate(payload: { messageIds: number[], status: 'read' | 'delivered', conversationId: number }) {
        if (payload.conversationId !== otherUserId) return;
        
        setMessages(prev => prev.map(msg => {
            if (payload.messageIds.includes(msg.id)) {
                return { ...msg, status: payload.status };
            }
            return msg;
        }));
    }

    function handleDmError(payload: { error: string }) {
      toast.error(payload.error || 'Failed to send message');
    }

    socket.on('dm:message', handleMessage);
    socket.on('dm:typing', handleTyping);
    socket.on('dm:status_update', handleStatusUpdate);
    socket.on('dm:error', handleDmError);

    return () => {
      socket.off('dm:message', handleMessage);
      socket.off('dm:typing', handleTyping);
      socket.off('dm:status_update', handleStatusUpdate);
      socket.off('dm:error', handleDmError);
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
    
    // Check if we are dragging into a child element (which triggers leave on parent)
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }

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
    <Card 
      className="flex h-full flex-col overflow-hidden border-border/70 bg-card relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background pointer-events-none animate-in fade-in zoom-in duration-200 border-2 border-dashed border-primary/50 m-2 rounded-xl">
          <div className="text-center flex flex-col items-center gap-2">
             <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
               <Download className="h-10 w-10 text-primary animate-bounce" />
             </div>
             <h3 className="text-xl font-semibold text-primary">Drop file here to upload</h3>
             <p className="text-sm text-muted-foreground">Release to send the file</p>
          </div>
        </div>
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border py-2 px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 -ml-2" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
            
            {/* Avatar */}
            {otherUser?.avatarUrl ? (
                <img src={otherUser.avatarUrl} alt={title} className="w-10 h-10 rounded-full object-cover" />
            ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                    {title.charAt(title.startsWith('@') ? 1 : 0).toUpperCase()}
                </div>
            )}
            
          <div className="flex flex-col">
            <CardTitle className="text-base font-medium leading-tight">{title}</CardTitle>
            <p className="text-xs text-muted-foreground">
               {typingLabel ? (
                   <span className="text-primary font-semibold animate-pulse">{typingLabel}</span>
               ) : isOtherUserOnline ? (
                   'Online'
               ) : (
                   formatLastSeen(otherUser?.lastOnlineAt ?? null) || 'Offline'
               )}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent 
        ref={messagesContainerRef}
        className="flex-1 space-y-3 overflow-y-auto overflow-x-hidden p-4 sm:px-12 md:px-16 scroll-smooth 
                   bg-background/50 
                   scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
      >

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
             const isOwn = msg.senderUserId !== otherUserId;
             const prevMsg = messages[index - 1]; 
             const isSameSender = prevMsg && prevMsg.senderUserId === msg.senderUserId;
             const showTail = !isSameSender;

             return (
               <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  isOwn={isOwn} 
                  showTail={showTail} 
                  onImageClick={setSelectedImage}
                />
             );
        })}

        {typingLabel && (
          <TypingIndicator />
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-2 sm:p-3 bg-background border-t border-border flex flex-col gap-2">
          {/* Attachment Preview */}
          {imageUrl && (
            <div className="flex items-center gap-2 rounded-md bg-muted p-2 shadow-sm w-fit max-w-full animate-in slide-in-from-bottom-2">
              {isImage(imageUrl) ? (
                 <img src={imageUrl} alt="preview" className="h-12 w-12 rounded object-cover border" />
              ) : (
                 <div className="h-12 w-12 flex items-center justify-center bg-primary/10 rounded">{getFileIcon(imageUrl)}</div>
              )}
              <div className="flex-1 min-w-0 max-w-[200px] px-2">
                  <p className="text-sm truncate">{getFileName(imageUrl)}</p>
              </div>
              <button 
                  onClick={handleRemoveAttachment} 
                  className="p-1 hover:bg-muted-foreground/20 rounded-full text-muted-foreground"
              >
                  <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <ImageUploadButton onImageUpload={url => setImageUrl(url)} />
            
            <div className="flex-1 relative">
                <Textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message"
                    disabled={!connected || sending}
                    className="min-h-[40px] max-h-[120px] py-2 px-4 resize-none 
                               bg-muted/50 border-transparent focus:border-input focus:ring-1 focus:ring-ring rounded-xl
                               shadow-sm scrollbar-hide"
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                    }}
                />
            </div>
            
            <Button 
                size="icon" 
                className={`h-10 w-10 shrink-0 rounded-full transition-all duration-200 ${
                    input.trim() || imageUrl ? '' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={handleSend} 
                disabled={sending || !connected || (!input.trim() && !imageUrl)}
            >
                <Send className="w-5 h-5 ml-0.5" />
            </Button>
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