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
    gRef?: React.RefObject<SVGGElement | null>;
    avatar: AvatarModel;
}
export function Avatar({gRef, avatar}: Props){
    return <g ref={gRef} transform={`translate(${avatar.position[0]} ${avatar.position[1]})`}>
        <circle r={24} fill="#99aaFF"></circle>
        <text textAnchor="middle" dominantBaseline="middle">{avatar.name}</text>
    </g>;
}
interface SelfAvatarProps extends Props{
    onPositionChanged?: (position: [number, number])=>void;
}
export function SelfAvatar({gRef, avatar, onPositionChanged}: SelfAvatarProps){
    const gr = useRef<SVGGElement>(null!);
    if(!gRef) gRef = gr;
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
        gRef.current?.setAttribute("transform", `translate(${avatar.position[0] + dx} ${avatar.position[1] + dy})`);
    }
    const onPointerUp = (e: PointerEvent<SVGGElement>)=>{
        e.preventDefault();
        if(drag.current === null) return;
        const {dx, dy} = drag.current.move(e.clientX, e.clientY);
        avatar.translate(dx, dy);
        if(onPositionChanged) onPositionChanged(avatar.position);
        drag.current = null;
    }
    return <g ref={gRef} transform={`translate(${avatar.position[0]} ${avatar.position[1]})`}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <circle r={24} fill="#0fa"></circle>
        <text textAnchor="middle" dominantBaseline="middle">{avatar.name}</text>
    </g>;
}