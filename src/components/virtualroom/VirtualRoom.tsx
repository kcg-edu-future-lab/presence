import { FormEvent, useRef, useState } from "react";
import { Avatar, SelfAvatar } from "./Avatar";
import { VirtualRoomModel } from "./model/VirtualRoomModel";
import { VirtualRoomOwnModel } from "./model/VirtualRoomOwnModel";
import { Button, InputAdornment, TextField, Tooltip } from "@mui/material";
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';

interface Props{
    vrm: VirtualRoomModel;
    vrom: VirtualRoomOwnModel;
    onSelfNameChange: (name: string)=>void;
}
export function VirtualRoom({vrm, vrom, onSelfNameChange}: Props){
    const nameInput = useRef<HTMLInputElement>(null!);
    const bgInput = useRef<HTMLInputElement>(null!);
    const [name, setName] = useState(()=>vrom.selfPeer.name);

    const onNameChange = (e: FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        const name = nameInput.current.value.trim();
        if(!name || name === "") return;
        vrom.selfPeer.name = name;
        setName(name);
        if(onSelfNameChange) onSelfNameChange(name);
    };
    const onBackgroundChange = (e: FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        const url = bgInput.current.value.trim();
        if(!url || url === "") return;
        vrm.background = url;
    };

    return <>
        <div>
            <form onSubmit={onNameChange} style={{display: "inline-block"}}>
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
        <svg style={{width: "512px", height: "512px", backgroundImage: `url(${vrm.background})`}}>
            {/* self */}
            {<SelfAvatar avatar={vrom.selfPeer} />}
            {/* peers */}
            {vrom.otherPeers.map(p=><Avatar key={p.id} avatar={p} />)}
        </svg>
    </>;
}
