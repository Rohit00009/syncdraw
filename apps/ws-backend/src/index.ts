import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: number[]; // changed to number[]
  userId: string;
}
const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || typeof decoded === "string" || !decoded.userId) {
      console.error("Invalid decoded payload:", decoded);
      return null;
    }
    return decoded.userId;
  } catch (e) {
    console.error("JWT verify failed:", e);
    return null;
  }
}

wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) return;

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (!userId) {
    ws.close();
    return;
  }

  const user: User = { userId, rooms: [], ws };
  users.push(user);

  ws.on("message", async (data) => {
    let parsedData: any;
    try {
      parsedData = JSON.parse(data.toString());
    } catch {
      console.error("Invalid JSON received");
      return;
    }

    if (parsedData.type === "join_room" || parsedData.type === "leave_room") {
      const slug = parsedData.roomId; // actually the slug
      if (!slug) return console.error("Invalid roomId:", slug);

      const room = await prismaClient.room.findFirst({ where: { slug } });
      if (!room) return console.error("Room not found for slug:", slug);

      const roomId = room.id; // numeric ID for Prisma

      if (parsedData.type === "join_room") {
        if (!user.rooms.includes(roomId)) user.rooms.push(roomId);

        try {
          await prismaClient.room.update({
            where: { id: roomId },
            data: { members: { connect: { id: userId } } },
          });
        } catch (e) {
          console.error("Failed to join room:", e);
        }
      }

      if (parsedData.type === "leave_room") {
        user.rooms = user.rooms.filter((x) => x !== roomId);

        try {
          await prismaClient.room.update({
            where: { id: roomId },
            data: { members: { disconnect: { id: userId } } },
          });
        } catch (e) {
          console.error("Failed to leave room:", e);
        }
      }
    }

    if (parsedData.type === "chat") {
      const roomId = Number(parsedData.roomId);
      const { message } = parsedData;

      try {
        await prismaClient.chat.create({
          data: {
            roomId,
            message,
            userId,
          },
        });
      } catch (e) {
        console.error("Failed to save chat:", e);
      }

      // Broadcast chat to all users in the room
      users.forEach((u) => {
        if (u.rooms.includes(roomId) && u.ws.readyState === WebSocket.OPEN) {
          u.ws.send(JSON.stringify({ type: "chat", roomId, message, userId }));
        }
      });
    }

    if (parsedData.type === "draw") {
      // get room numeric ID
      const room = await prismaClient.room.findFirst({
        where: { slug: parsedData.roomId },
      });
      if (!room) return;
      const roomId = room.id;
      const { shape } = parsedData;

      // broadcast to all users in the same room
      users.forEach((u) => {
        if (u.rooms.includes(roomId) && u.ws.readyState === WebSocket.OPEN) {
          u.ws.send(JSON.stringify({ type: "draw", roomId, shape, userId }));
        }
      });
    }
  });

  ws.on("close", () => {
    const idx = users.indexOf(user);
    if (idx >= 0) users.splice(idx, 1);
  });
});
