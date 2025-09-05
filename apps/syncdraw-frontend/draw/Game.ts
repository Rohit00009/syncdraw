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
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;

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

    // update cursor based on tool
    if (tool === "grab") {
      this.canvas.style.cursor = "grab";
    } else if (tool === "pointer") {
      this.canvas.style.cursor = "default";
    } else if (tool === "pencil") {
      this.canvas.style.cursor = "crosshair";
    } else if (tool === "eraser") {
      this.canvas.style.cursor = "not-allowed";
    } else {
      this.canvas.style.cursor = "crosshair"; // fallback for drawing tools
    }
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
    const { ctx, canvas } = this;

    ctx.save();

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Fill black background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply camera (pan + zoom)
    ctx.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY);

    // --- Infinite grid background (dim lines on black) ---
    const gridSize = 40;
    const startX = -this.offsetX / this.scale - canvas.width / (2 * this.scale);
    const startY =
      -this.offsetY / this.scale - canvas.height / (2 * this.scale);
    const endX = startX + canvas.width / this.scale + 2000;
    const endY = startY + canvas.height / this.scale + 2000;

    ctx.beginPath();
    for (
      let x = Math.floor(startX / gridSize) * gridSize;
      x < endX;
      x += gridSize
    ) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (
      let y = Math.floor(startY / gridSize) * gridSize;
      y < endY;
      y += gridSize
    ) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.1)"; // faint white grid
    ctx.lineWidth = 1 / this.scale;
    ctx.stroke();

    // --- Draw shapes (in world space) ---
    this.existingShapes.forEach((shape) => this.drawShape(shape));

    ctx.restore();
  }

  private drawShape(shape: Shape) {
    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";
    this.ctx.lineWidth = 2 / this.scale;

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
        break;
      case "line":
        this.ctx.beginPath();
        this.ctx.moveTo(shape.x1, shape.y1);
        this.ctx.lineTo(shape.x2, shape.y2);
        this.ctx.stroke();
        break;
      case "text":
        this.ctx.font = `${16 / this.scale}px Arial`;
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

  private screenToWorld(x: number, y: number) {
    return {
      x: (x - this.offsetX) / this.scale,
      y: (y - this.offsetY) / this.scale,
    };
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

    const { x, y } = this.screenToWorld(e.offsetX, e.offsetY);
    this.startX = x;
    this.startY = y;

    if (this.selectedTool === "grab") {
      this.isPanning = true;
      this.panStartX = e.clientX;
      this.panStartY = e.clientY;
      this.canvas.style.cursor = "grabbing";
      return;
    }

    if (this.selectedTool === "pencil") {
      this.currentPencilPoints = [{ x, y }];
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
    } else if (this.selectedTool === "pointer") {
      for (let i = this.existingShapes.length - 1; i >= 0; i--) {
        const shape = this.existingShapes[i];
        if (this.isInsideShape(shape, x, y)) {
          this.selectedShape = shape;

          if (shape.type === "rect" || shape.type === "text") {
            this.offsetX = x - shape.x;
            this.offsetY = y - shape.y;
          } else if (shape.type === "circle") {
            this.offsetX = x - shape.centerX;
            this.offsetY = y - shape.centerY;
          } else if (shape.type === "line" || shape.type === "pencil") {
            this.prevX = x;
            this.prevY = y;
          }
          break;
        }
      }
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;

    const { x: currentX, y: currentY } = this.screenToWorld(
      e.offsetX,
      e.offsetY
    );

    if (this.selectedTool === "pointer") {
      this.selectedShape = null;
      return;
    }

    let shape: Shape | null = null;
    const id = crypto.randomUUID();
    const width = currentX - this.startX;
    const height = currentY - this.startY;

    if (this.selectedTool === "grab" && this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = "grab";
      return;
    }

    if (this.selectedTool === "rect") {
      shape = {
        id,
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (this.selectedTool === "circle") {
      const radius = Math.sqrt(width ** 2 + height ** 2);
      shape = {
        id,
        type: "circle",
        centerX: this.startX,
        centerY: this.startY,
        radius,
      };
    } else if (this.selectedTool === "line") {
      shape = {
        id,
        type: "line",
        x1: this.startX,
        y1: this.startY,
        x2: currentX,
        y2: currentY,
      };
    } else if (this.selectedTool === "pencil") {
      shape = { id, type: "pencil", points: this.currentPencilPoints };
    } else if (this.selectedTool === "eraser") {
      // same logic but use world coords
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

    if (!shape) return;

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
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;

    const { x: currentX, y: currentY } = this.screenToWorld(
      e.offsetX,
      e.offsetY
    );

    // redraw everything
    this.clearCanvas();

    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2 / this.scale;

    if (this.selectedTool === "grab" && this.isPanning) {
      const dx = e.clientX - this.panStartX;
      const dy = e.clientY - this.panStartY;
      this.panStartX = e.clientX;
      this.panStartY = e.clientY;

      this.offsetX += dx;
      this.offsetY += dy;
      this.clearCanvas();
    } else if (this.selectedTool === "pencil") {
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
        this.startX, // already stored in world coords
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
