import { RoomChat } from "@/components/rooms/room-chat";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RoomChat roomId={parseInt(id)} />;
}
