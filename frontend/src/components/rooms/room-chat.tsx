"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { io, Socket } from 'socket.io-client';
import { Send, ArrowLeft, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createBrowserApiClient, apiGetRaw, apiGet } from '@/lib/api-client';
import { TopicRoom, RoomMessage } from '@/types/room';
import { toast } from 'sonner';

interface RoomChatProps {
  roomId: number;
}

export function RoomChat({ roomId }: RoomChatProps) {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const apiClient = useMemo(() => {
    const client = createBrowserApiClient(getToken);
    // Override base URL to target root /api instead of /chat-app/api
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';
    client.defaults.baseURL = baseUrl.replace(/\/chat-app\/?$/, '');
    return client;
  }, [getToken]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<TopicRoom | null>(null);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch Room & Connect Socket
  useEffect(() => {
    let newSocket: Socket | null = null;
    let isMounted = true;

    async function init() {
      try {
        const token = await getToken();
        if (!token) return;

        // 1. Fetch Room Details
        const roomData = await apiGet<TopicRoom>(apiClient, `/api/rooms/${roomId}`);
        
        if (!isMounted) return;
        setRoom(roomData);

        // 2. Load initial messages
         const msgs = await apiGet<RoomMessage[]>(apiClient, `/api/rooms/${roomId}/messages`);
        
        if (!isMounted) return;
        setMessages(msgs);
        setLoading(false);

        // 3. Connect Socket
        // We use the SAME socket URL but we need to ensure we auth correctly.
        // The backend `io.ts` expects auth token in handshake? 
        // socket.handshake.auth.userId (clerk user id).
        // Wait, `io.ts` logic: `const clerkUserId = socket.handshake.auth?.userId;`
        // We need to pass this.
        
        // Use NEXT_PUBLIC_SOCKET_API instead of API base URL to avoid path issues
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_API ?? 'http://localhost:5000';
        
        newSocket = io(socketUrl, {
          auth: { userId: userId }, // Pass Clerk User ID
          withCredentials: true
        });

        newSocket.on('connect', () => {
          console.log('Socket connected');
        });

        newSocket.on('ready', () => {
          console.log('Server ready, joining room...');
          newSocket?.emit('room:join', roomId);
        });

        newSocket.on('room:message', (msg: RoomMessage) => {
          setMessages(prev => [...prev, msg]);
        });

        newSocket.on('room:participant_update', (data: { roomId: number, count: number }) => {
            if (data.roomId === roomId) {
                setRoom(prev => prev ? { ...prev, participantCount: data.count } : null);
            }
        });
        
        newSocket.on('room:error', (err: { message: string }) => {
            toast.error(err.message);
        });

        setSocket(newSocket);
      } catch (err) {
        console.error(err);
        toast.error('Failed to join room');
        router.push('/rooms');
      }
    }

    init();

    return () => {
      isMounted = false;
      if (newSocket) {
        newSocket.emit('room:leave', roomId);
        newSocket.disconnect();
      }
    };
  }, [roomId, getToken, userId, router]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !socket) return;

    socket.emit('room:message', { roomId, content: inputValue });
    setInputValue('');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading room...</div>;
  }

  if (!room) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/rooms')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-lg">{room.title}</h2>
            <div className="flex items-center text-xs text-muted-foreground gap-3">
              <span className="flex items-center"><Users className="h-3 w-3 mr-1"/> {room.participantCount || 0} active</span>
              <span className="flex items-center"><Clock className="h-3 w-3 mr-1"/> Expires {new Date(room.expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-hidden relative">
         <div 
           ref={scrollRef} 
           className="h-full overflow-y-auto p-4 space-y-4"
         >
            {messages.map((msg, i) => {
                // Determine if message is from current user
                // The message.userId is INTERNAL ID.
                // We only have Clerk ID in `userId` from useAuth().
                // We can't strictly compare unless we fetch our own internal ID or check sender name?
                // `msg.sender` has data.
                // Hack: We can assume if we just sent it... but for incoming?
                // Ideally frontend should know its internal ID.
                // Let's rely on alignment for now, maybe all left aligned to keep it simple "Group Chat" style?
                // Or try to match sender.displayName if available? 
                
                // Better: Just display all left aligned with avatars, like Discord/Slack.
                
                return (
                  <div key={msg.id || i} className="flex gap-3">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={msg.sender?.avatarUrl || ''} />
                      <AvatarFallback>{msg.sender?.displayName?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col max-w-[80%]">
                       <span className="text-xs text-muted-foreground font-medium mb-1">
                         {msg.sender?.displayName || 'Unknown'} <span className="text-[10px] opacity-70 ml-2">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                       </span>
                       <div className="px-3 py-2 bg-muted rounded-md text-sm text-foreground">
                         {msg.content}
                       </div>
                    </div>
                  </div>
                );
            })}
         </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            placeholder={`Message #${room.category}...`}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" size="icon" disabled={!inputValue.trim()}>
             <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
