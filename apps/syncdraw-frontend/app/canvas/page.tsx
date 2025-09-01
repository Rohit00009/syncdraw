"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/http";

export default function CanvasLanding() {
  const router = useRouter();
  const [roomSlug, setRoomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleJoin() {
    if (!roomSlug) {
      setMessage("Please enter a room ID");
      return;
    }
    router.push(`/canvas/${roomSlug}`);
  }

  async function handleCreate() {
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post(
        "/room",
        { name: roomSlug || `room-${Date.now()}` }, // send a name
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const roomId = res.data.roomId; // backend returns slug
      router.push(`/canvas/${roomId}`);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="px-8 py-10 w-[380px] rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
        <div className="text-4xl mb-8 font-extrabold text-center bg-gradient-to-r from-green-400 via-green-600 to-green-400 bg-[length:200%_200%] animate-gradient bg-clip-text text-transparent">
          CANVAS
        </div>

        <div className="text-white/80 text-center mb-6 text-lg">
          Join or create a new room
        </div>

        {/* Join existing room */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomSlug}
            onChange={(e) => setRoomSlug(e.target.value)}
            className="w-full border border-white/30 bg-white/10 placeholder-white/60 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          />
        </div>

        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full py-3 mb-4 rounded-xl font-semibold bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? "Loading..." : "Join Room"}
        </button>

        {/* Create new room */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create New Room"}
        </button>

        {message && (
          <p className="text-center text-sm text-red-400 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}
