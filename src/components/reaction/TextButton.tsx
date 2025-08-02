import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren{
    onClick?: (text: string)=>void;
}
export function TextButton({onClick, children}: Props){
    const text = children?.toString();
    const onButtonClick = ()=>{
        if(onClick) onClick(text || "");
    };
    return <button onClick={onButtonClick}
        type="button" className="btn btn-light" style={{borderRadius: "4px"}}>
        {children}
    </button>
}
