import { useEffect, useRef, useState } from "react";
import { StreamCreatedListener, StreamManager, StreamUpdatedListener } from "../../util/StreamManagers";
import { MadoiIdChangedListener, NameChangedListener, SelfPeerModel, SkyWayIdChangedListener } from "./model/SelfPeerModel";
import { bundleCleanups, eventListnersEffect } from "madoi-client-react";

interface Props{
    model: SelfPeerModel;
    sm: StreamManager;
}
export function SelfVideo({model, sm}: Props){
    const videoRef = useRef<HTMLVideoElement>(null!);
    const [madoiId, setMadoiId] = useState(model.madoiId);
    const [name, setName] = useState(model.name);
    const [skyWayId, setSkyWayId] = useState(model.skyWayId);

    const madoiIdChanged: MadoiIdChangedListener = ({detail: {madoiId}})=>{
        setMadoiId(madoiId);
    }
    const nameChanged: NameChangedListener = ({detail: {name}})=>{
        setName(name);
    }
    const skyWayIdChanged: SkyWayIdChangedListener = ({detail: {skyWayId}})=>{
        setSkyWayId(skyWayId);
    }
    const streamCreated: StreamCreatedListener = ({detail: {stream}})=>{
        const s = new MediaStream();
        stream.getVideoTracks().forEach(t=>s.addTrack(t));
        videoRef.current.srcObject = s;
    };
    const streamUpdated: StreamUpdatedListener = ({detail: {stream}})=>{
        const s = new MediaStream();
        stream.getVideoTracks().forEach(t=>s.addTrack(t));
        videoRef.current.srcObject = s;
    };

    useEffect(()=>{
        return bundleCleanups(
            eventListnersEffect(model, {madoiIdChanged, nameChanged, skyWayIdChanged}),
            eventListnersEffect(sm, {streamCreated, streamUpdated})
        );
    });

    return <div style={{
        display: "inline-block", verticalAlign: "top", border: "1px solid darkgray",
        resize: "both", overflow: "hidden", width: "200px", height: "200px",
        position: "relative"}}>
        <video ref={videoRef} data-madoiid={madoiId} data-skywayid={skyWayId}
            width="100%" height="100%" style={{ display: "inline-block" }}
            autoPlay playsInline muted />
        <div style={{position: "absolute", bottom: "0px", color: "white",
            width: "100%", background: "rgba(180, 180, 255, 0.4)"}}>{name}</div>
    </div>;
}

/* TODO ドラッグ&ドロップでの仮想背景画像変更
const bgImage = new Image();
bgImage.src = "./room.png";
const mv = document.querySelector("#my-view") as HTMLDivElement;
mv.addEventListener('drop', (e: any) =>{
  e.stopPropagation();
  e.preventDefault();
  var files = e.dataTransfer.files;
  var fr = new FileReader();
  fr.readAsDataURL(files[0]);
  fr.onload = ()=>{
      bgImage.src = fr.result as string;
  };
}, false);
mv.addEventListener("dragover", e=>{
  e.stopPropagation();
  e.preventDefault();
});
*/
