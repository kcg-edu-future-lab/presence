import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren{
    src: string;
    volume: number;
    onClick?: (src: string, volume: number, text?: string)=>void;
}
export function AudioTextButton({src, volume, onClick, children}: Props){
    const text = children?.toString();
    const onButtonClick = ()=>{
        if(onClick) onClick(src, volume, text);
    };
    return <button onClick={onButtonClick}
        type="button" className="btn btn-light" style={{borderRadius: "4px"}}>
        {children}
    </button>
}
