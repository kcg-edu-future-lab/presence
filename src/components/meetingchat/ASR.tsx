import { ASREngine } from "../../util/ASREngine";
import { MouseEventHandler, useEffect, useRef, useState } from "react";

interface Props{
    engine: ASREngine;
}
export function ASR({engine}: Props){
  const first = useRef(true);
  const [enabled, setEnabled] = useState(engine.isRecognizing());
  const onEnabledClick: MouseEventHandler<HTMLInputElement> = e=>{
    if(e.currentTarget.checked){
        engine.start();
        setEnabled(true);
    } else{
        engine.stop();
    }
  };
  const onKeepEnabledClick: MouseEventHandler<HTMLInputElement> = e=>{
    engine.setKeepEnabled(e.currentTarget.checked);    
  };
  const onEngineFinished = ()=>{
      setEnabled(false);
  };
  useEffect(()=>{
    if(first.current){
      engine.setKeepEnabled(true);
      first.current = false;
    }
    engine.addEventListener("finished", onEngineFinished);
    return ()=>{
      engine.removeEventListener("finished", onEngineFinished);
    };
  },[]);
  return <div>
    <label style={{marginBottom: 0}}>
      <input type="checkbox" checked={enabled} onClick={onEnabledClick} />音声認識</label>&nbsp;
    <label style={{marginBottom: 0}}>
      <input type="checkbox" defaultChecked={true} onClick={onKeepEnabledClick} />onにし続ける(最長1時間)</label>&nbsp;
  </div>;
}
