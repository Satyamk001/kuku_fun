'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { createBrowserApiClient, apiGet } from '@/lib/api-client';
import { FriendUser } from '@/types/friend';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function FriendList() {
  const { getToken } = useAuth();
  const router = useRouter(); // Use router for navigation if needed or Link is fine
  const apiClient = useMemo(() => createBrowserApiClient(getToken), [getToken]);
  
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
  }, [apiClient]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const data = await apiGet<FriendUser[]>(apiClient, '/api/friends');
      setFriends(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4 text-muted-foreground">Loading friends...</div>;

  if (friends.length === 0) return <div className="text-center py-8 text-muted-foreground">You haven't added any friends yet.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {friends.map(friend => (
        <div key={friend.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-card/80 transition-colors">
           <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={friend.avatarUrl || undefined} />
                <AvatarFallback>{friend.displayName?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="font-medium text-foreground truncate">{friend.displayName || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground truncate">@{friend.handle || 'user'}</p>
              </div>
            </div>
            
            <Link href={`/chat?userId=${friend.id}`}>
               <Button size="icon" variant="ghost" className="rounded-full text-primary hover:bg-primary/10">
                 <MessageSquare className="w-5 h-5" />
               </Button>
            </Link>
        </div>
      ))}
    </div>
  );
}
