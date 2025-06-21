import { PointerEvent, useRef } from "react";
import { AvatarModel } from "./model/AvatarModel";

class DragState{
    constructor(private _x: number = 0, private _y: number = 0){
    }
    move(x: number, y: number){
        const dx = x - this._x;
        const dy = y - this._y;
        return {dx, dy};
    }
}
interface Props{
    avatar: AvatarModel;
}
export function Avatar({avatar}: Props){
    return <g transform={`translate(${avatar.position[0]} ${avatar.position[1]})`}>
        <circle r={24} fill="#99aaFF"></circle>
        <text textAnchor="middle" dominantBaseline="middle">{avatar.name}</text>
    </g>;
}
export function SelfAvatar({avatar}: Props){
    const gr = useRef<SVGGElement>(null!);
    const drag = useRef<DragState | null>(null);
    const onPointerDown = (e: PointerEvent<SVGGElement>)=>{
        e.preventDefault();
        drag.current = new DragState(e.clientX, e.clientY);
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent<SVGGElement>)=>{
        e.preventDefault();
        if(drag.current === null) return;
        const {dx, dy} = drag.current.move(e.clientX, e.clientY);
        gr.current.setAttribute("transform", `translate(${avatar.position[0] + dx} ${avatar.position[1] + dy})`);
    }
    const onPointerUp = (e: PointerEvent<SVGGElement>)=>{
        e.preventDefault();
        if(drag.current === null) return;
        const {dx, dy} = drag.current.move(e.clientX, e.clientY);
        avatar.translate(dx, dy);
        drag.current = null;
    }
    return <g ref={gr} transform={`translate(${avatar.position[0]} ${avatar.position[1]})`}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <circle r={24} fill="#0fa"></circle>
        <text textAnchor="middle" dominantBaseline="middle">{avatar.name}</text>
    </g>;
}