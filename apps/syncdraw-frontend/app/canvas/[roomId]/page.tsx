"use client";

import React, { useEffect, useState } from "react";
import { RoomCanvas } from "@/components/RoomCanvas";
import { api } from "@/lib/http";

interface CanvasPageProps {
  params: Promise<{ roomId: string }>;
}

export default function CanvasPage({ params }: CanvasPageProps) {
  const { roomId } = React.use(params); //works now since React is imported

  const [roomName, setRoomName] = useState<string>("");

  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await api.get(`/room/${roomId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setRoomName(res.data.name);
      } catch (err) {
        console.error("Failed to fetch room", err);
      }
    }

    if (roomId) fetchRoom();
  }, [roomId]);
  return (
    <div className="w-full h-full relative">
      {/* Floating box top-right */}
      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl px-4 py-2 text-sm text-white">
        <div className="relative group inline-block cursor-pointer">
          <p className="text-gray-300">
            Room ID: <span className="font-mono">{roomId}</span>
          </p>

          {/* Tooltip on the left side */}
          <span className="absolute top-1/2 -translate-y-1/2 right-full mr-2 w-max bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Share this ID with others to join your room
          </span>
        </div>
      </div>

      {/* Canvas Area */}
      <RoomCanvas roomId={roomId} />
    </div>
  );
}
