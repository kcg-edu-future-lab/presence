import { LocalAudioStream, LocalStream, LocalVideoStream, RemoteAudioStream, RemoteVideoStream, RoomPublication, SkyWayAuthToken, SkyWayContext, SkyWayRoom, nowInSec, uuidV4 } from "@skyway-sdk/room";
import { TypedEventTarget } from "madoi-client";

export interface ConnectedDetail{
    selfPeerId: string;
}
export interface PeerStreamArrivedDetail{
    peerId: string;
    track: MediaStreamTrack;
    type: "audio" | "video";
}
export interface PeerStreamLeavedDetail{
    peerId: string;
}
export interface PeerLeavedDetail{
    peerId: string;
}

export class SkyWay extends TypedEventTarget<SkyWay, {
    connected: ConnectedDetail,
    peerStreamArrived: PeerStreamArrivedDetail,
    streamDestroyed: PeerStreamLeavedDetail,
    peerLeaved: PeerLeavedDetail
}>{
    constructor(private appId: string = "", private secret: string = "", private roomId = ""){
        super();
    }

    setAppId(appId: string){
        this.appId = appId;
    }

    setSecret(secret: string){
        this.secret = secret;
    }

    setRoomId(roomId: string){
        this.roomId = roomId;
    }

    private videoPub?: RoomPublication<LocalVideoStream>;

    replaceVideoStream(videoTracks: MediaStreamTrack[]){
        if(!this.videoPub) return;
        if(this.videoPub.stream?.track === videoTracks[0]) return;
        const s = new LocalVideoStream(videoTracks[0], {stopTrackWhenDisabled: false});
        this.videoPub.replaceStream(s, {releaseOldStream: false});
    }

    async start(selfStream: MediaStream){
        const context = await SkyWayContext.Create(createSkywayAuthToken(this.appId, this.secret));
        const room = await SkyWayRoom.FindOrCreate(
            context, {type: 'p2p', name: this.roomId});
        const me = await room.join();
        console.log(`[SkyWay.start] joined to room ${this.roomId}, selfId: ${me.id}`);
        window.addEventListener("beforeunload", ()=>{
            me.leave();
        });
        this.dispatchCustomEvent("connected", {selfPeerId: me.id});

        const audio = new LocalAudioStream(selfStream.getAudioTracks()[0], {stopTrackWhenDisabled: false});
        const video = new LocalVideoStream(selfStream.getVideoTracks()[0], {stopTrackWhenDisabled: false});
        await me.publish(audio);
        this.videoPub = await me.publish(video);
      
        // 他のユーザのpublicationをsubscribeする
        const subscribeAndAttach = async (publication: RoomPublication<LocalStream>) => {
            const publisherId = publication.publisher.id;
            if (publisherId === me.id) return;
            const { stream } = await me.subscribe(publication.id);
            console.log(`[SkyWay] subscribe to peer ${publisherId}, streamType: ${stream.contentType}`);
            if(stream instanceof RemoteVideoStream || stream instanceof RemoteAudioStream){
                this.dispatchCustomEvent("peerStreamArrived", {
                    peerId: publisherId, track: stream.track, type: stream.contentType});
            }
        };
        room.publications.forEach(subscribeAndAttach);
        room.onStreamPublished.add((e) => subscribeAndAttach(e.publication));
        room.onMemberLeft.add((e) => {
            if (e.member.id === me.id) return;
            this.dispatchCustomEvent("peerLeaved", {peerId: e.member.id});
        });
    }

    stop(){
        
    }
}

function createSkywayAuthToken(applicationId: string, secretKey: string){
    return new SkyWayAuthToken({
        jti: uuidV4(), iat: nowInSec(), exp: nowInSec() + 60 * 60 * 24,
        scope: {
            app: {
                id: applicationId, turn: true, actions: ['read'],
                channels: [{
                    id: '*', name: '*', actions: ['write'],
                    members: [{
                        id: '*', name: '*', actions: ['write'],
                        publication: { actions: ['write']},
                        subscription: { actions: ['write']},
                    }],
                    sfuBots: [{
                        actions: ['write'],
                        forwardings: [{
                            actions: ['write']
                        }]
                    }]
                }]
            }
        }
    }).encode(secretKey);
}