import { RoomCanvas } from "@/components/RoomCanvas";

interface Props {
  params: { roomId: string }; // props from App Router
}

export default async function CanvasPage({ params }: Props) {
  const roomId = params.roomId;

  console.log("Server Room ID from URL param:", roomId);

  return <RoomCanvas roomId={roomId} />;
}
