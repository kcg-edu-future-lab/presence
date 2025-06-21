import { PropsWithChildren, useEffect } from "react";
import { Madoi } from "madoi-client";
import { useSharedModel } from "madoi-client-react";
import { AudioPlayer } from "../common/model/AudioPlayer";
import { ClickeableText, ClickListener } from "../common/model/ClickableText";

interface Props extends PropsWithChildren{
    madoi: Madoi;
    onClick?: ClickListener;
    src: string;
    volume: number;
}
export function AudioTextButton({madoi, onClick, src, volume, children}: Props){
    const player = useSharedModel(madoi, ()=>new AudioPlayer(src, volume));
    const ct = useSharedModel(madoi, ()=>new ClickeableText());
    const text = children?.toString();
    const onButtonClick = ()=>{
        if(text) ct.click(text);
        player.play();
    };
    useEffect(()=>{
        if(onClick) ct.addEventListener("click", onClick);
        return ()=>{
            if(onClick) ct.removeEventListener("click", onClick);
        };
    }, []);
    return <button onClick={onButtonClick}
        type="button" className="btn btn-light" style={{borderRadius: "4px"}}>
        {children}
    </button>
}