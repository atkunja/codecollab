import { notFound } from "next/navigation";

import RoomClient from "./RoomClient";

type RoomPageProps = Readonly<{
  params: Promise<{ roomId: string }>;
}>;

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomId } = await params;

  if (!roomId) {
    notFound();
  }

  return <RoomClient roomId={roomId} />;
}
