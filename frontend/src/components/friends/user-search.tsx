'use client';

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Check, X } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { createBrowserApiClient, apiGet, apiPost } from '@/lib/api-client';
import { FriendUser } from '@/types/friend';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export function UserSearch() {
  const { getToken } = useAuth();
  const apiClient = useMemo(() => createBrowserApiClient(getToken), [getToken]);
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState<Set<number>>(new Set());

  useEffect(() => {
    handleSearch('');
  }, []);

  const handleSearch = async (q: string = query) => {
    setLoading(true);
    try {
      const data = await apiGet<FriendUser[]>(apiClient, `/api/friends/search?q=${encodeURIComponent(q)}`);
      setResults(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (userId: number) => {
    setRequesting(prev => new Set(prev).add(userId));
    try {
      await apiPost(apiClient, '/api/friends/request', { targetUserId: userId });
      toast.success('Friend request sent!');
      // Remove from list or mark as sent? 
      // Ideally move to "Pending" but for now let's just update local state to hide button
      setResults(prev => prev.filter(u => u.id !== userId));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send request');
    } finally {
      setRequesting(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input 
          placeholder="Search for new friends..." 
          value={query} 
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={() => handleSearch()} disabled={loading}>
          {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      <div className="space-y-2">
        {results.map(user => (
          <div key={user.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback>{user.displayName?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{user.displayName || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">@{user.handle || 'user'}</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="secondary" 
              disabled={requesting.has(user.id)}
              onClick={() => sendRequest(user.id)}
            >
               <UserPlus className="w-4 h-4 mr-2" />
               Add
            </Button>
          </div>
        ))}
        {results.length === 0 && query && !loading && (
           <p className="text-sm text-muted-foreground text-center py-4">No users found.</p>
        )}
      </div>
    </div>
  );
}
