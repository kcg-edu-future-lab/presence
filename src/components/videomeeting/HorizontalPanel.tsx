import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren{
}
export function HorizontalPanel({children}: Props){
    return <div>
        <div style={{verticalAlign: "top", backgroundColor: "black", width: "100%"}}>
            {children}
        </div>
    </div>;
}
