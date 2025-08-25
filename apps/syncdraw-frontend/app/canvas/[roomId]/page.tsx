"use client";

import { log } from "console";
import { useEffect, useRef } from "react";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      let clicked = true;
      let startX = 0;
      let startY = 0;

      canvas.addEventListener("mousedown", (event) => {
        clicked = true;
        startX = event.clientX;
        startY = event.clientY;
        console.log(event.clientX);
        console.log(event.clientY);
      });

      canvas.addEventListener("mouseup", (event) => {
        clicked = false;
        console.log(event.clientX);
        console.log(event.clientY);
      });

      canvas.addEventListener("mousemove", (event) => {
        if (clicked) {
          const width = event.clientX - startX;
          const height = event.clientY - startY;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.strokeRect(startX, startY, width, height);
        }
      });
    }
  }, [canvasRef]);
  return (
    <div>
      <canvas ref={canvasRef} width={500} height={500} />
    </div>
  );
}
