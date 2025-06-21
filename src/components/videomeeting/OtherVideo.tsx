import { useEffect, useRef, useState } from "react";
import { NameChangedListener, OtherPeerModel, SkyWayIdChangedListener, StreamChangedListener, VolumeChangedListener } from "./model/OtherPeerModel";
import { eventListnersEffect } from "madoi-client-react";

interface Props{
    model: OtherPeerModel;
}
export function OtherVideo({model}: Props){
    const videoRef = useRef<HTMLVideoElement>(null!);
    const [name, setName] = useState(model.name);
    const [skyWayId, setSkyWayId] = useState(model.skyWayId);

    const nameChanged: NameChangedListener = ({detail: {name}})=>{
        setName(name);
    };
    const volumeChanged: VolumeChangedListener = ({detail: {volume}})=>{
        const video = videoRef.current;
        video.volume = volume;
        video.style.opacity = "" + volume;
        console.log(`[OtherVideo] volume: ${volume}, madoiId: ${model.madoiId}, skyWayId: ${skyWayId}`);
    };
    const skyWayIdChanged: SkyWayIdChangedListener = ({detail: {skyWayId}})=>{
        setSkyWayId(skyWayId);
    };
    const streamChanged: StreamChangedListener = ({detail: {stream}})=>{
        const video = videoRef.current;
        video.srcObject = stream;
        video.muted = false;
        video.play();
    };
    useEffect(()=>{
        return eventListnersEffect(model,
            {nameChanged, volumeChanged, skyWayIdChanged, streamChanged});
    });

    return <div style={{
          display: "inline-block", verticalAlign: "top", border: "1px solid darkgray",
          resize: "both", overflow: "hidden", width: "200px", height: "200px",
          position: "relative"
          }}>
          <video ref={videoRef} data-madoiid={model.madoiId} data-skywayid={skyWayId} width="100%" height="100%"
              style={{ display: "inline-block" }} autoPlay playsInline />
          <div style={{position: "absolute", bottom: "0px", color: "white",
            width: "100%", background: "rgba(180, 180, 255, 0.4)"}}>{name}</div>
    </div>;
}
