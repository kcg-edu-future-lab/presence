import { ASREngine } from "../../util/ASREngine";
import { ChangeEventHandler, useEffect, useState } from "react";

interface Props{
    engine: ASREngine;
}
export function ASR({engine}: Props){
    const [enabled, setEnabled] = useState(engine.isRecognizing());
    const onEnabledChange: ChangeEventHandler<HTMLInputElement> = e=>{
        if(e.currentTarget.checked){
            engine.start();
            setEnabled(true);
        } else{
            engine.stop();
        }
    };
    const onKeepEnabledChange: ChangeEventHandler<HTMLInputElement> = e=>{
        engine.setKeepEnabled(e.currentTarget.checked);    
    };
    const onEngineFinished = ()=>{
        setEnabled(false);
    };
    useEffect(()=>{
        engine.addEventListener("finished", onEngineFinished);
        return ()=>{
            engine.removeEventListener("finished", onEngineFinished);
        };
    },[]);
    return <div>
        <label style={{marginBottom: 0}}>
            <input type="checkbox" checked={enabled} onChange={onEnabledChange} />音声認識</label>&nbsp;
        <label style={{marginBottom: 0}}>
            <input type="checkbox" defaultChecked={engine.isKeepEnabled()} onChange={onKeepEnabledChange} />onにし続ける(最長1時間)</label>&nbsp;
    </div>;
}
