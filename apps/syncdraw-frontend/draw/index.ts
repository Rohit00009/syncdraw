import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shape =
  | {
      id: string;
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      id: string;
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    };

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let existingShapes: Shape[] = await getExistingShapes(roomId);

  let clicked = false;
  let startX = 0;
  let startY = 0;
  let selectedShape: Shape | null = null;
  let offsetX = 0;
  let offsetY = 0;

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "chat") {
      const parsedShape = JSON.parse(message.message);
      existingShapes.push(parsedShape.shape);
      clearCanvas(existingShapes, canvas, ctx);
    } else if (message.type === "move_shape") {
      const updatedShape = message.shape as Shape;
      const index = existingShapes.findIndex((s) => s.id === updatedShape.id);
      if (index !== -1) {
        existingShapes[index] = updatedShape;
        clearCanvas(existingShapes, canvas, ctx);
      }
    }
  };

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.offsetX;
    startY = e.offsetY;

    const selectedTool = (window as any).selectedTool;

    if (selectedTool === "pointer") {
      for (let i = existingShapes.length - 1; i >= 0; i--) {
        const shape = existingShapes[i];
        if (isInsideShape(shape, startX, startY)) {
          selectedShape = shape;
          offsetX = startX - ("x" in shape ? shape.x : shape.centerX);
          offsetY = startY - ("y" in shape ? shape.y : shape.centerY);
          break;
        }
      }
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!clicked) return;
    const currentX = e.offsetX;
    const currentY = e.offsetY;
    const selectedTool = (window as any).selectedTool;

    if (selectedTool === "pointer" && selectedShape) {
      if (selectedShape.type === "rect") {
        selectedShape.x = currentX - offsetX;
        selectedShape.y = currentY - offsetY;
      } else if (selectedShape.type === "circle") {
        selectedShape.centerX = currentX - offsetX;
        selectedShape.centerY = currentY - offsetY;
      }

      clearCanvas(existingShapes, canvas, ctx);

      socket.send(
        JSON.stringify({ type: "move_shape", shape: selectedShape, roomId })
      );
      return;
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    selectedShape = null;
  });

  clearCanvas(existingShapes, canvas, ctx);
}

function clearCanvas(
  shapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  shapes.forEach((shape) => {
    ctx.strokeStyle = "white";
    if (shape.type === "rect")
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    }
  });
}

async function getExistingShapes(roomId: string): Promise<Shape[]> {
  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
  return res.data.messages.map(
    (x: { message: string }) => JSON.parse(x.message).shape
  );
}

function isInsideShape(shape: Shape, x: number, y: number): boolean {
  if (shape.type === "rect")
    return (
      x >= shape.x &&
      x <= shape.x + shape.width &&
      y >= shape.y &&
      y <= shape.y + shape.height
    );
  if (shape.type === "circle")
    return Math.hypot(x - shape.centerX, y - shape.centerY) <= shape.radius;
  return false;
}
