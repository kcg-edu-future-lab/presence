import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSharedModel } from 'madoi-client-react';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import { Grid } from '@mui/material';
import { Madoi } from 'madoi-client';
import vbImagePath from './defaultBackground.png';
import { SkyWay } from './util/SkyWay';
import { getLastPath } from './util/Util';
import { LocalJsonStorage } from './util/LocalJsonStorage';
import { CustomTabs } from './util/CustomTabs';
import { VideoMeetingOwnModel } from './components/videomeeting/model/VideoMeetingOwnModel';
import { VideoMeeting } from './components/videomeeting/VideoMeeting';
import { VirtualRoomModel } from './components/virtualroom/model/VirtualRoomModel';
import { VirtualRoomOwnModel } from './components/virtualroom/model/VirtualRoomOwnModel';
import { VirtualRoom } from './components/virtualroom/VirtualRoom';
import { ASREngine } from './util/ASREngine';
import { ChatLogs } from './components/meetingchat/model/ChatLogs';
import { ASRChat } from './components/meetingchat/ASRChat';
import { DrawingCanvas } from './components/whiteboard/model/DrawingCanvas';
import { Whiteboard } from './components/whiteboard/Whiteboard';
import { TagBoard } from './components/tagboard/TagBoard';
import { TagBoardModel } from './components/tagboard/model/TagBoardModel';
import { ClickListener } from './components/common/model/ClickableText';
import { ReactionButtons } from './components/reaction/ReactionButtons';
import { madoiUrl, madoiKey, skyWayEnabled, skyWayTokenUrl } from './keys';
import { MediaManager } from './util/media/MediaManager';
import { AvatarReactionModel } from './components/virtualroom/model/AvatarReactionModel';

const roomId: string = `sample-madoi-presence-${getLastPath(window.location.href)}-sdsfs24df2sdfsfjo4`;
const ls = new LocalJsonStorage<{id: string, name: string}>(roomId);
export const AppContext = createContext({
    storage: ls, 
    madoi: new Madoi(
        `${madoiUrl}/${roomId}`,
        madoiKey, {
            id: ls.get("id", ()=>uuidv4()),
            profile: {name: ls.get("name", "匿名")}
        }),
    asr: new ASREngine(true),
    mediaManager: skyWayEnabled ? new MediaManager(vbImagePath) : null,
    skyWay: skyWayEnabled ? new SkyWay({tokenUrl: skyWayTokenUrl, roomId}) : undefined
});

export default function App(){
    const first = useRef(true);
    const app = useContext(AppContext);
    const madoi = app.madoi;
    // ユーザ名は複数のコンポーネントで使用するのでstateで管理する。
    const [selfName, setSelfName] = useState(()=>madoi.getSelfPeerProfile()["name"]);

    // VideoMeeting
    const mediaManager = app.mediaManager;
    const skyWay = app.skyWay;
    const vmModel = useSharedModel(app.madoi, ()=>
        new VideoMeetingOwnModel(skyWay));

    // VirtualRoom
    const vrom = useSharedModel(app.madoi, ()=>
        new VirtualRoomOwnModel(roomId, selfName, [Math.random() * 300, Math.random() * 300]));
    const vrm = useSharedModel(app.madoi, ()=>
        new VirtualRoomModel(roomId, "defaultFloor_sd35.png"));
    const arm = useSharedModel(app.madoi, ()=>new AvatarReactionModel());
    const onVirtualRoomSelfNameChange = (name: string)=>{
        setSelfName(name);
        if(vmModel.selfPeer) vmModel.selfPeer.name = name;
        app.storage.set("name", name);
    };

    // MeetingChat
    const asr = app.asr;
    const chatLogs = useSharedModel(madoi, ()=>new ChatLogs());

    // WhiteBoard
    const canvas1 = useSharedModel(madoi, ()=>new DrawingCanvas(), false);
    const canvas2 = useSharedModel(madoi, ()=>new DrawingCanvas(), false);

    // TagBoard
    const tagBoardModel = useSharedModel(madoi, ()=>new TagBoardModel());

    // Reaction buttons
    const onReactionTextClick: ClickListener = ({detail: {text}})=>{
        arm.doReaction(vrom.selfPeer.id, text);
    };

    useEffect(()=>{
        if(!first.current) return;
        first.current = false;
        init(skyWay, vrom);
        setInterval(
            () => { adjustVolumes(vrom, vmModel); },
            1000);
    }, []);

    return <Grid container>
        <Grid size={12}>
            <VideoMeeting {...{model: vmModel, mediaManager, skyWay}} />
        </Grid>
        <Grid size={6}>
            <VirtualRoom {...{vrm, vrom, arm, selfName, onSelfNameChange: onVirtualRoomSelfNameChange}} />
        </Grid>
        <Grid size={6}>
            <CustomTabs labels={["チャット", "ボード1", "ボード2", "付箋ボード", "効果"]}>
                <ASRChat {...{selfName, asr, chatLogs }} />
                <Whiteboard canvas={canvas1}/>
                <Whiteboard canvas={canvas2}/>
                <TagBoard tagBoardModel={tagBoardModel}/>
                <ReactionButtons madoi={madoi} onTextClick={onReactionTextClick}/>
            </CustomTabs>
        </Grid>
    </Grid>;
}

async function init(skyWay: SkyWay | undefined, vrom: VirtualRoomOwnModel){
    skyWay?.addEventListener("connected", ({detail: {selfPeerId}})=>{
        console.log(`[App] SkyWayに接続しました。IDは${selfPeerId}です。`);
    });
    skyWay?.addEventListener("peerStreamArrived", ({detail: {peerId}})=>{
        console.log(`[App] ${peerId} がSkyWayで接続しました。`);
    });
    skyWay?.addEventListener("peerLeaved", ({detail: {peerId}})=>{
        console.log(`[App] ${peerId} がSkyWayから切断しました。`);
    });

    window.addEventListener("JOYCON", (e: any) => {
        const myAvatar = vrom.selfPeer;
        if (!myAvatar) return;
        switch (e.data["button"]) {
            case "UP":
                myAvatar.translate(0, -1);
                return;
            case "DOWN":
                myAvatar.translate(0, 1);
                return;
            case "LEFT":
                myAvatar.translate(-1, 0);
                return;
            case "RIGHT":
                myAvatar.translate(1, 0);
                return;
        }
    });
}

function adjustVolumes(
    vRoom: VirtualRoomOwnModel,
    vMeeting: VideoMeetingOwnModel) {
    const self = vRoom.selfPeer;
    vRoom.otherPeers.forEach(o => {
        const other = vMeeting.findOtherPeer(o.id);
        if(!other) return;
        const dist = Math.pow(self.position[0] - o.position[0], 2)
            + Math.pow(self.position[1] - o.position[1], 2);
        if (dist > 50000) {
            other.volume = 0;
        } else {
            other.volume = 1.0 - dist / 50000;
        }
    });
}
