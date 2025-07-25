import { FormEvent, useEffect, useRef, useState } from "react";
import { HorizontalPanel } from "./HorizontalPanel";
import { SkyWay } from "../../util/SkyWay";
import { VideoMeetingOwnModel } from "./model/VideoMeetingOwnModel";
import { SelfVideo } from "./SelfVideo";
import { OtherVideo } from "./OtherVideo";
import { MediaManager } from "../../util/media/MediaManager";
import { FormControlLabel, Tooltip } from "@mui/material";
import { IOSSwitch } from "../../util/MUI";
import { pink } from "@mui/material/colors";
import MicIcon from '@mui/icons-material/Mic';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';

interface Props{
    model: VideoMeetingOwnModel;
    skyWay?: SkyWay;
    mediaManager: MediaManager | null;
}
export function VideoMeeting({model, skyWay, mediaManager}: Props){
    const first = useRef(true);
    const [cameraOn, setCameraOn] = useState(false);
    const [micOn, setMicOn] = useState(false);
    const [screenShareOn, setScreenShareOn] = useState(false);

    const updateSkyWayStream = (stream: MediaStream)=>{
        let tracks = stream.getAudioTracks();
        if(tracks.length > 0) skyWay?.updateAudioStream(tracks[0]);
        tracks = stream.getVideoTracks();
        if(tracks.length > 0) skyWay?.updateVideoStream(tracks[0]);
    }
    const onCameraChange = (e: FormEvent<HTMLInputElement>)=>{
        const enabled = e.currentTarget.checked;
        setCameraOn(enabled);
        mediaManager?.setCameraEnabled(enabled);
    };
    const onMicChange = (e: FormEvent<HTMLInputElement>)=>{
        const enabled = e.currentTarget.checked;
        setMicOn(enabled);
        mediaManager?.setMicEnabled(enabled)
    };
    const onScreenShareChange = async (e: FormEvent<HTMLInputElement>)=>{
        const enabled = e.currentTarget.checked;
        await mediaManager?.setScreenShareEnabled(enabled);
        setScreenShareOn(mediaManager?.isScreenShareEnabled() || false);
    };

    useEffect(()=>{
        if(!first.current) return;
        first.current = false;
        skyWay?.start();
        mediaManager?.addEventListener("userStreamCreated", ({detail: {stream}})=>updateSkyWayStream(stream));
        mediaManager?.addEventListener("userStreamUpdated", ({detail: {stream}})=>updateSkyWayStream(stream));
        mediaManager?.addEventListener("screenShareStopped", ()=>{setScreenShareOn(false);});
        mediaManager?.start();
    });

    return skyWay && mediaManager && model.selfPeer ? <div>
        <HorizontalPanel>
            <SelfVideo model={model.selfPeer} sm={mediaManager.getScreenShareSM()} />
            {model.otherPeers.map(p=><OtherVideo key={p.madoiId} model={p} />)}
        </HorizontalPanel>
        {/* media controls */}
        <div>
            <Tooltip title="マイク">
                <FormControlLabel label={<MicIcon sx={{ color: micOn? pink[500] : "black" }}/>} labelPlacement="start" control={
                    <IOSSwitch sx={{ m: 1 }} checked={micOn} onChange={onMicChange} />
                }/>
            </Tooltip>
            <Tooltip title="カメラ">
                <FormControlLabel label={<VideoCameraFrontIcon sx={{ color: cameraOn? pink[500] : "black" }} />} labelPlacement="start" control={
                    <IOSSwitch sx={{ m: 1 }} checked={cameraOn} onChange={onCameraChange} />
                }/>
            </Tooltip>
            <Tooltip title="画面共有">
                <FormControlLabel label={<ScreenShareIcon sx={{ color: screenShareOn? pink[500] : "black" }}/>} labelPlacement="start" control={
                    <IOSSwitch sx={{ m: 1 }} checked={screenShareOn} onChange={onScreenShareChange} />
                }/>
            </Tooltip>
        </div>
    </div> : <></>;
}
