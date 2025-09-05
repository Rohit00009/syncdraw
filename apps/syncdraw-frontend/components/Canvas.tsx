import { useEffect, useRef, useState } from "react";
import { Game } from "@/draw/Game";
import { IconButton } from "./IconButton";
import {
  Circle,
  Eraser,
  Minus,
  MousePointer,
  Pencil,
  Pointer,
  RectangleHorizontal,
  Redo2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export type Tool =
  | "pointer"
  | "pencil"
  | "rect"
  | "circle"
  | "line"
  | "text"
  | "eraser"
  | "grab"
  | "undo"
  | "redo"
  | "zoom-in"
  | "zoom-out";

export function Canvas({
  roomId,
  socket,
}: {
  socket: WebSocket;
  roomId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [activeTool, setActiveTool] = useState<Tool>("pencil");

  useEffect(() => {
    game?.setTool(activeTool);
  }, [activeTool, game]);

  // call one-off actions when activeTool becomes special action
  useEffect(() => {
    if (!game) return;

    if (activeTool === "undo") {
      game.undo();
      setActiveTool("pointer"); // reset to pointer (or pencil if you prefer)
    } else if (activeTool === "redo") {
      game.redo();
      setActiveTool("pointer");
    } else if (activeTool === "zoom-in") {
      game.zoomIn();
      setActiveTool("pointer");
    } else if (activeTool === "zoom-out") {
      game.zoomOut();
      setActiveTool("pointer");
    } else {
      // for normal tools, set tool on the Game
      game.setTool(activeTool);
    }
  }, [activeTool, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      setGame(g);

      return () => {
        g.destroy?.();
      };
    }
  }, [canvasRef, roomId, socket]);

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="bg-white"
      />
      <Topbar activeTool={activeTool} setActiveTool={setActiveTool} />
    </div>
  );
}

function Topbar({
  activeTool,
  setActiveTool,
}: {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}) {
  return (
    <div
      className="
        fixed top-1/2 left-4 -translate-y-1/2 
        flex flex-col items-center gap-4 p-3
        rounded-2xl bg-white/10 backdrop-blur-lg 
        border border-white/20 shadow-xl z-50
      "
    >
      <IconButton
        onClick={() => setActiveTool("grab")}
        active={activeTool === "grab"}
        icon={<Pointer />}
      />

      <IconButton
        onClick={() => setActiveTool("pointer")}
        active={activeTool === "pointer"}
        icon={<MousePointer />}
      />
      <IconButton
        onClick={() => setActiveTool("pencil")}
        active={activeTool === "pencil"}
        icon={<Pencil />}
      />
      <IconButton
        onClick={() => setActiveTool("rect")}
        active={activeTool === "rect"}
        icon={<RectangleHorizontal />}
      />
      <IconButton
        onClick={() => setActiveTool("circle")}
        active={activeTool === "circle"}
        icon={<Circle />}
      />
      <IconButton
        onClick={() => setActiveTool("line")}
        active={activeTool === "line"}
        icon={<Minus />}
      />
      <IconButton
        onClick={() => setActiveTool("text")}
        active={activeTool === "text"}
        icon={<Type />}
      />
      <IconButton
        onClick={() => setActiveTool("eraser")}
        active={activeTool === "eraser"}
        icon={<Eraser />}
      />

      <div className="w-8 h-[1px] bg-white/20 my-2"></div>

      <IconButton
        onClick={() => setActiveTool("undo")}
        active={activeTool === "undo"}
        icon={<Undo2 />}
      />
      <IconButton
        onClick={() => setActiveTool("redo")}
        active={activeTool === "redo"}
        icon={<Redo2 />}
      />
      <IconButton
        onClick={() => setActiveTool("zoom-in")}
        active={activeTool === "zoom-in"}
        icon={<ZoomIn />}
      />
      <IconButton
        onClick={() => setActiveTool("zoom-out")}
        active={activeTool === "zoom-out"}
        icon={<ZoomOut />}
      />
    </div>
  );
}
