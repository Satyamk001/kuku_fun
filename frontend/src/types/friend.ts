export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendUser {
  id: number;
  displayName: string | null;
  handle: string | null;
  avatarUrl: string | null;
  friendshipId?: number; // Optional because search results might not have it
  status?: FriendshipStatus;
  isRequester?: boolean;
}
