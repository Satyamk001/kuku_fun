'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Clock } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { createBrowserApiClient, apiGet, apiPost } from '@/lib/api-client';
import { FriendUser } from '@/types/friend';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export function RequestList() {
  const { getToken } = useAuth();
  const apiClient = useMemo(() => createBrowserApiClient(getToken), [getToken]);
  
  const [requests, setRequests] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadRequests();
  }, [apiClient]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await apiGet<FriendUser[]>(apiClient, '/api/friends/requests');
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: number, status: 'accepted' | 'rejected') => {
    setProcessing(prev => new Set(prev).add(requestId));
    try {
      await apiPost(apiClient, '/api/friends/respond', { requestId, status });
      toast.success(status === 'accepted' ? 'Friend request accepted' : 'Friend request rejected');
      setRequests(prev => prev.filter(r => r.friendshipId !== requestId));
    } catch (error: any) {
      toast.error('Failed to respond');
      console.error(error);
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  if (loading) return <div className="text-center py-4 text-muted-foreground">Loading requests...</div>;

  if (requests.length === 0) return <div className="text-center py-8 text-muted-foreground">No pending requests.</div>;

  return (
    <div className="space-y-3">
      {requests.map(req => {
        // If I am the requester, I am waiting for them (Outgoing)
        // If I am NOT the requester, they sent it to me (Incoming) - Need to confirm check
        // Backend listPendingRequests logic:
        // "isRequester" true -> I sent it.
        const isIncoming = !req.isRequester;

        return (
          <div key={req.friendshipId} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
             <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={req.avatarUrl || undefined} />
                <AvatarFallback>{req.displayName?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{req.displayName || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">{isIncoming ? 'Sent you a request' : 'Request sent'}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isIncoming ? (
                <>
                  <Button 
                    size="sm" 
                    className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white"
                    disabled={processing.has(req.friendshipId!)}
                    onClick={() => handleRespond(req.friendshipId!, 'accepted')}
                  >
                    <Check className="w-4 h-4 mr-1" /> Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 px-2 text-destructive hover:bg-destructive/10"
                    disabled={processing.has(req.friendshipId!)}
                    onClick={() => handleRespond(req.friendshipId!, 'rejected')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="ghost" disabled className="h-8 text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" /> Pending
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
