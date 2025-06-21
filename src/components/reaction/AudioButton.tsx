import { PropsWithChildren } from "react";
import { Madoi } from "madoi-client";
import { useSharedModel } from "madoi-client-react";
import { AudioPlayer } from "../common/model/AudioPlayer";

interface Props extends PropsWithChildren{
    madoi: Madoi;
    src: string;
    volume: number;
}
export function AudioButton({madoi, src, volume, children}: Props){
    const player = useSharedModel(madoi, ()=>new AudioPlayer(src, volume));
    const onButtonClick = ()=>{
        player.play();
    };
    return <button onClick={onButtonClick}
        type="button" className="btn btn-light" style={{borderRadius: "4px"}}>
        {children}
    </button>
}