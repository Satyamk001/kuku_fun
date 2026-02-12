"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Plus, Search, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateRoomModal } from '@/components/rooms/create-room-modal';
import { createBrowserApiClient, apiGet, apiPost } from '@/lib/api-client';
import { TopicRoom, CreateRoomData } from '@/types/room';
import { toast } from 'sonner';

export default function RoomListPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const apiClient = useMemo(() => {
    const client = createBrowserApiClient(getToken);
    // Override base URL to target root /api instead of /chat-app/api
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';
    client.defaults.baseURL = baseUrl.replace(/\/chat-app\/?$/, '');
    return client;
  }, [getToken]);
  const [rooms, setRooms] = useState<TopicRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (category !== 'All') query.append('category', category);

      const rooms = await apiGet<TopicRoom[]>(apiClient, `/api/rooms?${query.toString()}`);
      setRooms(rooms);
    } catch (error) {
      console.error('Failed to fetch rooms', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [search, category]); // Debounce search in real app, basic for now

  const handleCreateRoom = async (data: CreateRoomData) => {
    try {
      console.log('User created');
      const room = await apiPost<TopicRoom>(apiClient, '/api/rooms', data);
      setRooms(prev => [room, ...prev]);
      toast.success('Room created successfully');
      router.push(`/rooms/${room.id}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to create room');
    }
  };

  const handleJoinRoom = (roomId: number) => {
      router.push(`/rooms/${roomId}`);
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 h-screen flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Topic Rooms</h1>
          <p className="text-muted-foreground mt-1">Join temporary discussions on various topics.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Room
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search rooms..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="h-10 w-[180px] rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="General">General</option>
          <option value="Tech">Tech</option>
          <option value="Music">Music</option>
          <option value="Gaming">Gaming</option>
          <option value="Crypto">Crypto</option>
        </select>
      </div>

      {loading && rooms.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1,2,3].map(i => (
             <Card key={i} className="h-40 animate-pulse bg-muted" />
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10">
          {rooms.map((room) => (
             <Card key={room.id} className="flex flex-col hover:shadow-md transition-shadow">
               <CardHeader className="pb-3">
                 <div className="flex justify-between items-start">
                   <Badge variant="secondary" className="mb-2">{room.category}</Badge>
                   <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(room.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                   </div>
                 </div>
                 <CardTitle className="text-lg leading-tight line-clamp-1">{room.title}</CardTitle>
               </CardHeader>
               <CardContent className="flex-1 flex flex-col justify-end gap-4">
                 <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{room.participantCount || 0} / {room.maxUsers}</span>
                    </div>
                 </div>
                 <Button className="w-full" onClick={() => handleJoinRoom(room.id)}>Join Room</Button>
               </CardContent>
             </Card>
          ))}
          {!loading && rooms.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              No active rooms found. create one!
            </div>
          )}
        </div>
      )}

      <CreateRoomModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreateRoom}
      />
    </div>
  );
}
