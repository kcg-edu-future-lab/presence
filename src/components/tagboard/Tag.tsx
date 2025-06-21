import { FormEvent, PointerEvent, useRef } from "react";
import { TagModel } from "./model/TagModel";

class DragState{
    constructor(private _x: number = 0, private _y: number = 0){
    }
    move(x: number, y: number){
        const dx = x - this._x;
        const dy = y - this._y;
        this._x = x;
        this._y = y;
        return {dx, dy};
    }
}

interface Props{
    tag: TagModel;
    onMove?: (tag: TagModel, dx: number, dy: number)=>void;
    onTextChange?: (tag: TagModel, text: string)=>void;
    onColorChange?: (tag: TagModel, color: string)=>void;
    onRemove?: (tag: TagModel)=>void;
}
export function Tag({tag, onMove, onTextChange, onColorChange, onRemove}: Props){
    const drag = useRef<DragState | null>(null);
    const onPointerDown = (e: PointerEvent<HTMLDivElement>)=>{
        e.preventDefault();
        drag.current = new DragState(e.clientX, e.clientY);
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent<HTMLDivElement>)=>{
        e.preventDefault();
        if(drag.current === null) return;
        const {dx, dy} = drag.current.move(e.clientX, e.clientY);
        if(onMove) onMove(tag, dx, dy);
    };
    const onPointerUp = (e: PointerEvent<HTMLDivElement>)=>{
        e.preventDefault();
        if(drag.current === null) return;
        drag.current = null;
    };
    const onTextAreaChange = (e: FormEvent<HTMLTextAreaElement>)=>{
        const text = (e.target as HTMLTextAreaElement).value;
        if(onTextChange) onTextChange(tag, text);
    };
    const onColorInputChange = (e: FormEvent<HTMLInputElement>)=>{
        const color = (e.target as HTMLInputElement).value;
        if(onColorChange) onColorChange(tag, color);
    };
    const onRemoveLinkClick = (e: PointerEvent<HTMLAnchorElement>)=>{
        e.preventDefault();
        if(onRemove) onRemove(tag);
    };
    const stopPropagation = (e: PointerEvent)=>{
        e.stopPropagation();
    }
    const pointerHandlers = {
        onPointerDown: stopPropagation,
        onPointerMove: stopPropagation,
        onPointerUp: stopPropagation,
    };

    return <div className="note"
            style={{position: "absolute", left: `${tag.position[0]}px`, top: `${tag.position[1]}px`,
                backgroundColor: tag.color}}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <textarea className="expanding" cols={12} onChange={onTextAreaChange} defaultValue={tag.label}
            {...pointerHandlers}
            />
        <a href="#" style={{verticalAlign: "top"}} onClick={onRemoveLinkClick}
            {...pointerHandlers}
            >×</a>
        <input type="color" onChange={onColorInputChange} defaultValue={tag.color}
            {...pointerHandlers}
            />
    </div>;
}