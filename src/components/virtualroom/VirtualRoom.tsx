import { createRef, FormEvent, RefObject, useEffect, useRef } from "react";
import { Avatar, SelfAvatar } from "./Avatar";
import { VirtualRoomModel } from "./model/VirtualRoomModel";
import { VirtualRoomOwnModel } from "./model/VirtualRoomOwnModel";
import { AvatarReactionListener, AvatarReactionModel } from "./model/AvatarReactionModel";
import { Button, InputAdornment, TextField, Tooltip } from "@mui/material";
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import "./VirtualRoom.css";

interface Props{
    vrm: VirtualRoomModel;
    vrom: VirtualRoomOwnModel;
    arm?: AvatarReactionModel;
    onSelfNameChanged?: (name: string)=>void;
    onSelfPositionChanged?: (position: [number, number])=>void;
}
export function VirtualRoom({vrm, vrom, arm, onSelfNameChanged, onSelfPositionChanged}: Props){
    const selfAvatarRef = useRef<SVGGElement>(null!);
    const othersAvatarRef = useRef<RefObject<SVGGElement | null>[]>([]);
    const nameInput = useRef<HTMLInputElement>(null!);
    const bgInput = useRef<HTMLInputElement>(null!);

    vrom.otherAvatars.forEach(()=>othersAvatarRef.current.push(createRef<SVGGElement>()));

    const onNameChanged = (e: FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        const name = nameInput.current.value.trim();
        if(!name || name === "") return;
        if(onSelfNameChanged) onSelfNameChanged(name);
    };
    const onPositionChanged = (position: [number, number])=>{
        if(onSelfPositionChanged) onSelfPositionChanged(position);
    };
    const onBackgroundChange = (e: FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        const url = bgInput.current.value.trim();
        if(!url || url === "") return;
        vrm.background = url;
    };
    const onAvatarReaction: AvatarReactionListener = ({detail: {avatarId, reaction}})=>{
        let ag = avatarId === vrom.selfAvatar.id ? selfAvatarRef.current : null;
        if(ag === null){
            const i = vrom.otherAvatars.findIndex(o=>avatarId===o.id);
            if(i !== -1) ag = othersAvatarRef.current[i].current;
        }
        if(ag === null) return;
        const box = ag.getBBox();
        const r = document.createElementNS("http://www.w3.org/2000/svg", "text");
        r.textContent = reaction;
        r.setAttribute("x", `${box.x}`);
        r.setAttribute("y", `${box.y + 10}`);
        r.setAttribute("width", "64");
        r.setAttribute("height", "32");
        r.classList.add("action_effect");
        r.addEventListener("animationend", ()=>{
            r.remove();
        });
        ag.appendChild(r);
    };

    useEffect(()=>{
        arm?.addEventListener("reaction", onAvatarReaction);
        return ()=>{
            arm?.removeEventListener("reaction", onAvatarReaction);
        };
    }, []);

    return <>
        <div>
            <form onSubmit={onNameChanged} style={{display: "inline-block"}}>
                <Tooltip title="名前">
                        <TextField inputRef={nameInput}
                            variant="outlined" defaultValue={name} size="small"
                            hiddenLabel />
                </Tooltip>
                <Button type="submit" variant="contained">変更</Button>
            </form>
            &nbsp;&nbsp;
            <form onSubmit={onBackgroundChange} style={{display: "inline-block"}}>
                <Tooltip title="背景">
                    <TextField inputRef={bgInput}
                        variant="outlined" defaultValue={vrm.background} size="small" 
                        slotProps={{
                            input: {startAdornment: <InputAdornment position="start">
                                    <PhotoSizeSelectActualIcon/>
                                </InputAdornment>} }}/>
                </Tooltip>
                <Button type="submit" variant="contained">変更</Button>
            </form>
        </div>
        <svg style={{width: "512px", height: "512px",
            backgroundImage: `url(${vrm.background})`,
            backgroundSize: "contain", backgroundPosition: "center"}}>
            {/* self */}
            {<SelfAvatar gRef={selfAvatarRef} avatar={vrom.selfAvatar} onPositionChanged={onPositionChanged} />}
            {/* peers */}
            {vrom.otherAvatars.map((a, i)=><Avatar gRef={othersAvatarRef.current[i]} key={a.id} avatar={a} />)}
        </svg>
    </>;
}
