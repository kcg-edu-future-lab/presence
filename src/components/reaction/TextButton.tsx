import { PropsWithChildren, useEffect } from "react";
import { Madoi } from "madoi-client";
import { useSharedModel } from "madoi-client-react";
import { ClickeableText, ClickListener } from "../common/model/ClickableText";

interface Props extends PropsWithChildren{
    madoi: Madoi;
    onClick?: ClickListener;
}
export function TextButton({madoi, onClick, children}: Props){
    const ct = useSharedModel(madoi, ()=>new ClickeableText());
    const text = children?.toString();
    const onButtonClick = ()=>{
        if(text) ct.click(text);
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
