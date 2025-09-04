import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

export type Shape =
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
    }
  | { id: string; type: "line"; x1: number; y1: number; x2: number; y2: number }
  | { id: string; type: "text"; x: number; y: number; text: string }
  | { id: string; type: "pencil"; points: { x: number; y: number }[] };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private clicked = false;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private currentPencilPoints: { x: number; y: number }[] = [];
  private selectedShape: Shape | null = null;
  private offsetX = 0;
  private offsetY = 0;
  private prevX = 0;
  private prevY = 0;
  private undoStack: Shape[][] = [];
  private redoStack: Shape[][] = [];
  private scale = 1;

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

      if (message.type === "draw" && message.roomId === this.roomId) {
        const shape: Shape = message.shape;
        // Avoid duplicating shapes you just sent
        if (!this.existingShapes.find((s) => s.id === shape.id)) {
          this.existingShapes.push(shape);
          this.clearCanvas();
        }
      } else if (message.type === "move_shape") {
        const updatedShape = message.shape as Shape;
        const index = this.existingShapes.findIndex(
          (s) => s.id === updatedShape.id
        );
        if (index !== -1) {
          this.existingShapes[index] = updatedShape;
          this.clearCanvas();
        }
      } else if (message.type === "delete_shape") {
        this.existingShapes = this.existingShapes.filter(
          (s) => s.id !== message.shapeId
        );
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.save();
    this.ctx.scale(this.scale, this.scale);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.existingShapes.forEach((shape) => this.drawShape(shape));
    this.ctx.restore();
  }

  private drawShape(shape: Shape) {
    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";
    this.ctx.lineWidth = 2;

    switch (shape.type) {
      case "rect":
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        break;
      case "circle":
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
        break;
      case "line":
        this.ctx.beginPath();
        this.ctx.moveTo(shape.x1, shape.y1);
        this.ctx.lineTo(shape.x2, shape.y2);
        this.ctx.stroke();
        break;
      case "text":
        this.ctx.font = "16px Arial";
        this.ctx.fillText(shape.text, shape.x, shape.y);
        break;
      case "pencil":
        this.ctx.beginPath();
        shape.points.forEach((p, idx) => {
          if (idx === 0) this.ctx.moveTo(p.x, p.y);
          else this.ctx.lineTo(p.x, p.y);
        });
        this.ctx.stroke();
        break;
    }
  }

  private isInsideShape(shape: Shape, x: number, y: number) {
    switch (shape.type) {
      case "rect":
        return (
          x >= shape.x &&
          x <= shape.x + shape.width &&
          y >= shape.y &&
          y <= shape.y + shape.height
        );
      case "circle":
        const dx = x - shape.centerX;
        const dy = y - shape.centerY;
        return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
      case "line": {
        const { x1, y1, x2, y2 } = shape;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.hypot(x - x1, y - y1) < 5;
        let t = ((x - x1) * dx + (y - y1) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        return Math.hypot(x - projX, y - projY) <= 5;
      }
      case "pencil":
        return shape.points.some(
          (p) => Math.abs(p.x - x) < 5 && Math.abs(p.y - y) < 5
        );
      case "text":
        return (
          x >= shape.x - 5 &&
          x <= shape.x + 50 &&
          y >= shape.y - 16 &&
          y <= shape.y + 5
        );
      default:
        return false;
    }
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.offsetX;
    this.startY = e.offsetY;

    if (this.selectedTool === "pencil") {
      this.currentPencilPoints = [{ x: this.startX, y: this.startY }];
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
    } else if (this.selectedTool === "pointer") {
      for (let i = this.existingShapes.length - 1; i >= 0; i--) {
        const shape = this.existingShapes[i];
        if (this.isInsideShape(shape, this.startX, this.startY)) {
          this.selectedShape = shape;

          if (shape.type === "rect" || shape.type === "text") {
            this.offsetX = this.startX - shape.x;
            this.offsetY = this.startY - shape.y;
          } else if (shape.type === "circle") {
            this.offsetX = this.startX - shape.centerX;
            this.offsetY = this.startY - shape.centerY;
          } else if (shape.type === "line" || shape.type === "pencil") {
            this.prevX = this.startX;
            this.prevY = this.startY;
          }
          break;
        }
      }
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    const currentX = e.offsetX;
    const currentY = e.offsetY;

    if (this.selectedTool === "pointer") {
      this.selectedShape = null;
      return;
    }

    let shape: Shape | null = null;
    const id = crypto.randomUUID();
    const width = currentX - this.startX;
    const height = currentY - this.startY;

    if (this.selectedTool === "rect")
      shape = {
        id,
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(width ** 2 + height ** 2);
      shape = {
        id,
        type: "circle",
        centerX: this.startX,
        centerY: this.startY,
        radius,
      };
    } else if (this.selectedTool === "line")
      shape = {
        id,
        type: "line",
        x1: this.startX,
        y1: this.startY,
        x2: currentX,
        y2: currentY,
      };
    else if (this.selectedTool === "pencil") {
      shape = { id, type: "pencil", points: this.currentPencilPoints };
    } else if (this.selectedTool === "eraser") {
      for (let i = this.existingShapes.length - 1; i >= 0; i--) {
        if (
          this.isInsideShape(this.existingShapes[i], this.startX, this.startY)
        ) {
          this.undoStack.push([...this.existingShapes]);
          this.redoStack = [];

          const removedShape = this.existingShapes.splice(i, 1)[0];
          this.clearCanvas();

          this.socket.send(
            JSON.stringify({
              type: "delete_shape",
              shapeId: removedShape.id,
              roomId: this.roomId,
            })
          );
          break;
        }
      }
    } else if (this.selectedTool === "text") {
      const text = prompt("Enter text:") || "";
      shape = { id, type: "text", x: this.startX, y: this.startY, text };
    }

    if (!shape) {
      return;
    }
    if (shape) {
      this.undoStack.push([...this.existingShapes]);
      this.redoStack = [];
      this.existingShapes.push(shape);
      this.clearCanvas();
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
    this.clearCanvas();
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;

    if (this.selectedTool === "pointer" && this.selectedShape) {
      if (
        this.selectedShape.type === "rect" ||
        this.selectedShape.type === "text"
      ) {
        this.selectedShape.x = currentX - this.offsetX;
        this.selectedShape.y = currentY - this.offsetY;
      } else if (this.selectedShape.type === "circle") {
        this.selectedShape.centerX = currentX - this.offsetX;
        this.selectedShape.centerY = currentY - this.offsetY;
      } else if (this.selectedShape.type === "line") {
        const dx = currentX - this.prevX;
        const dy = currentY - this.prevY;
        this.selectedShape.x1 += dx;
        this.selectedShape.y1 += dy;
        this.selectedShape.x2 += dx;
        this.selectedShape.y2 += dy;
        this.prevX = currentX;
        this.prevY = currentY;
      } else if (this.selectedShape.type === "pencil") {
        const dx = currentX - this.prevX;
        const dy = currentY - this.prevY;
        this.selectedShape.points = this.selectedShape.points.map((p) => ({
          x: p.x + dx,
          y: p.y + dy,
        }));
        this.prevX = currentX;
        this.prevY = currentY;
      }

      this.socket.send(
        JSON.stringify({
          type: "move_shape",
          shape: this.selectedShape,
          roomId: this.roomId,
        })
      );
      return;
    }

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
      this.ctx.strokeRect(
        this.startX,
        this.startY,
        currentX - this.startX,
        currentY - this.startY
      );
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(
        (currentX - this.startX) ** 2 + (currentY - this.startY) ** 2
      );
      this.ctx.beginPath();
      this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    } else if (this.selectedTool === "line") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
    }
  };

  undo() {
    if (this.undoStack.length > 0) {
      this.redoStack.push([...this.existingShapes]);
      this.existingShapes = this.undoStack.pop()!;
      this.clearCanvas();
    }
  }
  redo() {
    if (this.redoStack.length > 0) {
      this.undoStack.push([...this.existingShapes]);
      this.existingShapes = this.redoStack.pop()!;
      this.clearCanvas();
    }
  }
  zoomIn() {
    this.scale *= 1.1;
    this.clearCanvas();
  }
  zoomOut() {
    this.scale /= 1.1;
    this.clearCanvas();
  }

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
