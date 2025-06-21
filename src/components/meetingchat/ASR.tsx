import { ASREngine } from "../../util/ASREngine";
import { MouseEventHandler, useEffect } from "react";

interface Props{
    engine: ASREngine;
}
export function ASR({engine}: Props){
  const onEnabledClick: MouseEventHandler<HTMLInputElement> = e=>{
    if(e.currentTarget.checked){
        engine.start();
    } else{
        engine.stop();
    }
  };
  const onKeepEnabledClick: MouseEventHandler<HTMLInputElement> = e=>{
    engine.setKeepEnabled(e.currentTarget.checked);    
  };
  useEffect(()=>{
    engine.setKeepEnabled(true);
  },[])
  return <div>
    <label style={{marginBottom: 0}}>
      <input type="checkbox" defaultChecked={engine.isRecognizing()} onClick={onEnabledClick} />音声認識</label>&nbsp;
    <label style={{marginBottom: 0}}>
      <input type="checkbox" defaultChecked={true} onClick={onKeepEnabledClick} />onにし続ける(最長1時間)</label>&nbsp;
  </div>;
}
