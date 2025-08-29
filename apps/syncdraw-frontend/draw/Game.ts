import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; centerX: number; centerY: number; radius: number }
  | { type: "line"; x1: number; y1: number; x2: number; y2: number }
  | { type: "text"; x: number; y: number; text: string }
  | { type: "pencil"; points: { x: number; y: number }[] };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private clicked: boolean = false;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private currentPencilPoints: { x: number; y: number }[] = [];
  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0,0,0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes.forEach((shape) => {
      this.ctx.strokeStyle = "white";
      this.ctx.fillStyle = "white";

      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          shape.radius,
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.x1, shape.y1);
        this.ctx.lineTo(shape.x2, shape.y2);
        this.ctx.stroke();
      } else if (shape.type === "text") {
        this.ctx.font = "16px Arial";
        this.ctx.fillText(shape.text, shape.x, shape.y);
      } else if (shape.type === "pencil") {
        this.ctx.beginPath();
        shape.points.forEach((p, idx) => {
          if (idx === 0) this.ctx.moveTo(p.x, p.y);
          else this.ctx.lineTo(p.x, p.y);
        });
        this.ctx.stroke();
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.offsetX;
    this.startY = e.offsetY;

    if (this.selectedTool === "pencil") {
      this.currentPencilPoints = [{ x: this.startX, y: this.startY }];
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    const currentX = e.offsetX;
    const currentY = e.offsetY;
    const width = currentX - this.startX;
    const height = currentY - this.startY;

    let shape: Shape | null = null;

    if (this.selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(width ** 2 + height ** 2);
      shape = {
        type: "circle",
        centerX: this.startX,
        centerY: this.startY,
        radius,
      };
    } else if (this.selectedTool === "line") {
      shape = {
        type: "line",
        x1: this.startX,
        y1: this.startY,
        x2: currentX,
        y2: currentY,
      };
    } else if (this.selectedTool === "text") {
      shape = { type: "text", x: currentX, y: currentY, text: "Type here" };
    } else if (this.selectedTool === "pencil") {
      shape = { type: "pencil", points: this.currentPencilPoints };
    }

    if (shape) {
      this.existingShapes.push(shape);
      this.socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({ shape }),
          roomId: this.roomId,
        })
      );
    }
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;

    const currentX = e.offsetX;
    const currentY = e.offsetY;
    const width = currentX - this.startX;
    const height = currentY - this.startY;

    this.clearCanvas();
    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";
    this.ctx.lineWidth = 1;

    if (this.selectedTool === "pencil") {
      this.currentPencilPoints.push({ x: currentX, y: currentY });
      this.ctx.beginPath();
      this.ctx.moveTo(
        this.currentPencilPoints[0].x,
        this.currentPencilPoints[0].y
      );
      this.currentPencilPoints.forEach((p) => this.ctx.lineTo(p.x, p.y));
      this.ctx.stroke();
    } else if (this.selectedTool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, width, height);
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(width ** 2 + height ** 2);
      this.ctx.beginPath();
      this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "line") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
    } else if (this.selectedTool === "text") {
      this.ctx.font = "16px Arial";
      this.ctx.fillText("Type here", currentX, currentY);
    } else if (this.selectedTool === "eraser") {
      this.ctx.strokeStyle = "black";
      this.ctx.lineWidth = 20;
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
