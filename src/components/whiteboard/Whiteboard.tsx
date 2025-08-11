import { FormEventHandler, useEffect, useRef } from "react";
import { Box, Grid, IconButton, Tooltip } from "@mui/material";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { DrawingCanvas } from "./model/DrawingCanvas";
import { copyCanvasImageToClipboard, downloadCanvasImageByAnchorTag } from "../../util/Util";

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
    const onDownloadClick: FormEventHandler = async e=>{
        e.preventDefault();
        downloadCanvasImageByAnchorTag("whiteboard.png", canvas.current);
    };
    const onCopyClick: FormEventHandler = e=>{
        e.preventDefault();
        copyCanvasImageToClipboard(canvas.current);
    };

    useEffect(()=>{
        dc.attach(canvas.current, sizeInput.current, colorInput.current);
        return ()=>{
            dc.detach();
        };
    }, [dc]);

    return <Grid container>
        <Grid size={6}>
            <EditIcon style={{verticalAlign: "middle"}} />
            <Tooltip title="Pen size">
                <input ref={sizeInput} type="number" style={{width: "2em", verticalAlign: "middle"}} defaultValue={2} min={1} max={10} step={1} required></input>
            </Tooltip>
            &nbsp;
            <Tooltip title="Pen color">
                <input ref={colorInput} type="color" style={{width: "2em", height: "2em", verticalAlign: "middle"}}></input>
            </Tooltip>
            &nbsp;
            <Tooltip title="Reset canvas">
                <IconButton onClick={onClearClick}>
                    <RestartAltIcon/>
                </IconButton>
            </Tooltip>
            &nbsp;
        </Grid>
        <Grid size={6}>
            <Box display="flex" justifyContent="flex-end">
                <IconButton size="small" onClick={onCopyClick}>
                    <ContentCopyIcon className="Whiteboard_button"/>
                </IconButton>
                <IconButton size="small" onClick={onDownloadClick}>
                    <CloudDownloadIcon className="Whiteboard_button"/>
                </IconButton>
            </Box>
        </Grid>
        <Grid size={12} >
            <canvas ref={canvas} width={560} height={480} style={{border: "black 1px solid", borderRadius: "4px"}}></canvas>
        </Grid>
    </Grid>;
}
