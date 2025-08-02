import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren{
    src: string;
    volume: number;
    onClick?: (src: string, volume: number)=>void;
}
export function AudioButton({src, volume, onClick, children}: Props){
    const onButtonClick = ()=>{
        if(onClick) onClick(src, volume);
    };
    return <button onClick={onButtonClick}
        type="button" className="btn btn-light" style={{borderRadius: "4px"}}>
        {children}
    </button>
}
