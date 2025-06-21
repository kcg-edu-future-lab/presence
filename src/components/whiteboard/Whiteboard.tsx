import { useEffect, useRef } from "react";
import { DrawingCanvas } from "./model/DrawingCanvas";

interface Props{
  canvas: DrawingCanvas;
}
export function Whiteboard({canvas: dc}: Props){
  const canvas = useRef<HTMLCanvasElement>(null!);
  const sizeInput = useRef<HTMLInputElement>(null!);
  const colorInput = useRef<HTMLInputElement>(null!);
  useEffect(()=>{
    dc.attach(canvas.current, sizeInput.current, colorInput.current);
    return ()=>{
      dc.detach();
    }
  }, [dc]);

  return <>
    <div>
      Size:  <input ref={sizeInput} type="number" defaultValue={2} min={1} max={10} step={1} required></input>
      Color: <input ref={colorInput} type="color"></input>
    </div>
    <canvas ref={canvas} width={640} height={480}></canvas>
  </>;
}
