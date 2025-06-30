import { FormEvent, useEffect, useRef, useState } from "react";
import { HorizontalPanel } from "./HorizontalPanel";
import { SkyWay } from "../../util/SkyWay";
import { StreamCreatedListener, StreamUpdatedListener, TakingplaceScreenStreamManager, UserMediaStreamManager, VirtualBackgroundStreamManager } from "../../util/StreamManagers";
import { VideoMeetingOwnModel } from "./model/VideoMeetingOwnModel";
import { SelfVideo } from "./SelfVideo";
import { OtherVideo } from "./OtherVideo";
import { FormControlLabel, Tooltip } from "@mui/material";
import { IOSSwitch } from "../../util/MUI";
import { pink } from "@mui/material/colors";
import MicIcon from '@mui/icons-material/Mic';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';

interface Props{
    skyWay: SkyWay;
    userMediaSM: UserMediaStreamManager;
    vitrualBgSM: VirtualBackgroundStreamManager;
    screenShareSM: TakingplaceScreenStreamManager;
    model: VideoMeetingOwnModel;
}
export function VideoMeeting({model, skyWay, userMediaSM, vitrualBgSM, screenShareSM}: Props){
    const first = useRef(true);
    const [cameraOn, setCameraOn] = useState(false);
    const [micOn, setMicOn] = useState(false);
    const [screenShareOn, setScreenShareOn] = useState(false);

    const onUserStreamCreated: StreamCreatedListener = ({detail: {stream}})=>{
        skyWay.start(stream);
    };
    const onUserStreamUpdated: StreamUpdatedListener = ({detail: {stream}})=>{
        skyWay.replaceVideoStream(stream.getVideoTracks());
    };
    const onCameraChange = (e: FormEvent<HTMLInputElement>)=>{
        const enabled = e.currentTarget.checked;
        setCameraOn(enabled);
        userMediaSM.setCameraState(enabled);
    };
    const onMicChange = (e: FormEvent<HTMLInputElement>)=>{
        const enabled = e.currentTarget.checked;
        setMicOn(enabled);
        userMediaSM.setMicState(enabled)
    };
    const onScreenShareChange = async (e: FormEvent<HTMLInputElement>)=>{
        const enabled = e.currentTarget.checked;
        await screenShareSM.setEnabled(enabled);
        setScreenShareOn(screenShareSM.enabled);
    };

    useEffect(()=>{
        if(!first.current) return;
        first.current = false;
        vitrualBgSM.attach(userMediaSM);
        screenShareSM.attach(vitrualBgSM);
        screenShareSM.addEventListener("streamCreated", onUserStreamCreated);
        screenShareSM.addEventListener("streamUpdated", onUserStreamUpdated);
        screenShareSM.onScreenShareStopped = ()=>setScreenShareOn(false);
        userMediaSM.acquire();
    });

    return <div>
        <HorizontalPanel>
            <SelfVideo model={model.selfPeer} sm={screenShareSM} />
            {model.otherPeers.map(p=><OtherVideo key={p.madoiId} model={p} />)}
        </HorizontalPanel>
        {/* media controls */}
        <div>
            <Tooltip title="マイク">
                <FormControlLabel label={<MicIcon sx={{ color: micOn? pink[500] : "black" }}/>} control={
                    <IOSSwitch sx={{ m: 1 }} checked={micOn} onChange={onMicChange} />
                }/>
            </Tooltip>
            <Tooltip title="カメラ">
                <FormControlLabel label={<VideoCameraFrontIcon sx={{ color: cameraOn? pink[500] : "black" }} />} control={
                    <IOSSwitch sx={{ m: 1 }} checked={cameraOn} onChange={onCameraChange} />
                }/>
            </Tooltip>
            <Tooltip title="画面共有">
                <FormControlLabel label={<ScreenShareIcon sx={{ color: screenShareOn? pink[500] : "black" }}/>} control={
                    <IOSSwitch sx={{ m: 1 }} checked={screenShareOn} onChange={onScreenShareChange} />
                }/>
            </Tooltip>
        </div>
    </div>;
}
