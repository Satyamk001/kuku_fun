export interface TopicRoom {
  id: number;
  title: string;
  category: string;
  creatorId: number;
  maxUsers: number;
  participantCount?: number;
  createdAt: string; // ISO date
  expiresAt: string; // ISO date
}

export interface RoomMessage {
  id: number;
  roomId: number;
  userId: number;
  content: string;
  createdAt: string;
  sender?: {
    id: number;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface CreateRoomData {
  title: string;
  category: string;
  durationMinutes: number;
  maxUsers: number;
}
