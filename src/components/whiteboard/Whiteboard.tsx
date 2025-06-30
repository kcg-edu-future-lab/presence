import { useEffect, useRef } from "react";
import { DrawingCanvas } from "./model/DrawingCanvas";
import { Button, TextField } from "@mui/material";

interface Props{
    canvas: DrawingCanvas;
}
export function Whiteboard({canvas: dc}: Props){
    const canvas = useRef<HTMLCanvasElement>(null!);
    const sizeInput = useRef<HTMLInputElement>(null!);
    const colorInput = useRef<HTMLInputElement>(null!);

    const onClearClick = ()=>{
        dc.clear();
    };

    useEffect(()=>{
        dc.attach(canvas.current, sizeInput.current, colorInput.current);
        return ()=>{
            dc.detach();
        };
    }, [dc]);

    return <>
        <div>
            <TextField inputRef={sizeInput} type="number" label="Size" size="small" slotProps={{
                htmlInput: {min: 1, max: 10, step: 1}}} defaultValue={2}></TextField>
            <TextField inputRef={colorInput} type="color" label="Color" size="small" sx={{ width: '4em' }}></TextField>
            &nbsp; &nbsp;
            <Button size="small" variant="contained" color="error" onClick={onClearClick}>Clear</Button>
        </div>
        <canvas ref={canvas} style={{borderRadius: "4px", border: "solid 1px"}}
            width={640} height={480}></canvas>
    </>;
}
