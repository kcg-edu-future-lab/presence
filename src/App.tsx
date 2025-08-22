import { createContext, useContext, useEffect, useRef } from 'react';
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
import { AvatarReactionModel } from './components/virtualroom/model/AvatarReactionModel';
import { VirtualRoom } from './components/virtualroom/VirtualRoom';
import { ASREngine } from './util/ASREngine';
import { ChatLogs } from './components/meetingchat/model/ChatLogs';
import { ASRChat } from './components/meetingchat/ASRChat';
import { DrawingCanvas } from './components/whiteboard/model/DrawingCanvas';
import { Whiteboard } from './components/whiteboard/Whiteboard';
import { TagBoard } from './components/tagboard/TagBoard';
import { TagBoardModel } from './components/tagboard/model/TagBoardModel';
import { AudioPlayer } from './components/common/model/AudioPlayer';
import { ReactionButtons } from './components/reaction/ReactionButtons';
import { madoiUrl, madoiKey, skyWayEnabled, skyWayTokenUrl } from './keys';
import { MediaManager } from './util/media/MediaManager';
import { YjsDocument } from './components/common/model/YjsDocument';
import { Mermaid } from './components/mermaid/Mermaid';

const roomId: string = `sample-madoi-presence-${getLastPath(window.location.href)}-sdsdffs24df2sdfsfjo4`;
const ls = new LocalJsonStorage<{id: string, name: string, position: [number, number]}>(roomId);
export const AppContext = createContext({
    storage: ls, 
    madoi: new Madoi(
        `${madoiUrl}/${roomId}`,
        madoiKey, {
            id: ls.get("id", ()=>uuidv4()),
            profile: {
                name: ls.get("name", "匿名"),
                position: ls.get("position", [Math.random() * 300, Math.random() * 300])
            }
        }),
    asr: new ASREngine(true),
    mediaManager: skyWayEnabled ? new MediaManager(vbImagePath) : null,
    skyWay: skyWayEnabled ? new SkyWay({tokenUrl: skyWayTokenUrl, roomId}) : undefined
});

export default function App(){
    const first = useRef(true);
    const app = useContext(AppContext);
    const madoi = app.madoi;

    // VideoMeeting
    const mediaManager = app.mediaManager;
    const skyWay = app.skyWay;
    const vmModel = useSharedModel(app.madoi, ()=>
        new VideoMeetingOwnModel(skyWay));

    // VirtualRoom
    const vrom = useSharedModel(app.madoi, ()=>
        new VirtualRoomOwnModel());
    const vrm = useSharedModel(app.madoi, ()=>
        new VirtualRoomModel(roomId, "defaultFloor_sd35.png"));
    const arm = useSharedModel(app.madoi, ()=>new AvatarReactionModel());
    const onVirtualRoomSelfNameChanged = (name: string)=>{
        app.madoi.updateSelfPeerProfile("name", name);
        app.storage.set("name", name);
    };
    const onVirtualRoomSelfPositionChanged = (position: [number, number])=>{
        app.madoi.updateSelfPeerProfile("position", position);
        app.storage.set("position", position);
    };

    // MeetingChat
    const asr = app.asr;
    const chatLogs = useSharedModel(madoi, ()=>new ChatLogs());

    // WhiteBoard
    const canvas1 = useSharedModel(madoi, ()=>new DrawingCanvas(), false);
    const canvas2 = useSharedModel(madoi, ()=>new DrawingCanvas(), false);

    // TagBoard
    const tagBoardModel = useSharedModel(madoi, ()=>new TagBoardModel());

    // Mermaid
    const ydoc = useSharedModel(madoi, ()=>new YjsDocument(madoi));

    // Reaction buttons
    const audioPlayer = useSharedModel(madoi, ()=>new AudioPlayer());
    const onReactionTextClick = (text: string)=>{
        arm.doReaction(vrom.selfAvatar.id, text);
        chatLogs.addReaction(text);
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
            <VirtualRoom {...{vrm, vrom, arm,
                onSelfNameChanged: onVirtualRoomSelfNameChanged,
                onSelfPositionChanged: onVirtualRoomSelfPositionChanged}} />
        </Grid>
        <Grid size={6}>
            <CustomTabs labels={["チャット", "ボード1", "ボード2", "付箋ボード", "Mermaid", "効果"]}>
                <ASRChat {...{asr, chatLogs }} />
                <Whiteboard canvas={canvas1}/>
                <Whiteboard canvas={canvas2}/>
                <TagBoard tagBoardModel={tagBoardModel}/>
                <Mermaid ydoc={ydoc}/>
                <ReactionButtons audioPlayer={audioPlayer} onTextClick={onReactionTextClick}/>
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
        const myAvatar = vrom.selfAvatar;
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
    const self = vRoom.selfAvatar;
    vRoom.otherAvatars.forEach(o => {
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
