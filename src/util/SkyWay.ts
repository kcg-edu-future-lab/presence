import { LocalAudioStream, LocalP2PRoomMember, LocalStream, LocalVideoStream, RemoteAudioStream, RemoteVideoStream, RoomMember, RoomPublication, SkyWayAuthToken, SkyWayContext, SkyWayRoom, nowInSec, uuidV4 } from "@skyway-sdk/room";
import { TypedCustomEventTarget } from "tcet";

export interface ConnectedDetail{
    selfPeerId: string;
}
export interface PeerArrivedDetail{
    peerId: string;
}
export interface PeerStreamArrivedDetail{
    peerId: string;
    track: MediaStreamTrack;
    type: "audio" | "video";
}
export interface PeerLeavedDetail{
    peerId: string;
}

export class SkyWay extends TypedCustomEventTarget<SkyWay, {
    connected: ConnectedDetail;
    peerArrived: PeerArrivedDetail;
    peerStreamArrived: PeerStreamArrivedDetail;
    peerLeaved: PeerLeavedDetail;
}>{
    constructor(private appId: string, private secret: string, private roomId: string){
        super();
    }

    private me?: LocalP2PRoomMember;
    private audioPub?: RoomPublication<LocalAudioStream>;
    private videoPub?: RoomPublication<LocalVideoStream>;

    async updateAudioStream(audioTrack: MediaStreamTrack){
        if(!this.me) throw new Error("SkyWay not started.");
        const ls = new LocalAudioStream(audioTrack, {stopTrackWhenDisabled: true});
        if(!this.audioPub){
            this.audioPub = await this.me.publish(ls);
        } else{
            if(this.audioPub.stream?.track === audioTrack) return;
            this.audioPub.replaceStream(ls, {releaseOldStream: false});
        }
    }

    async updateVideoStream(videoTrack: MediaStreamTrack){
        if(!this.me) throw new Error("SkyWay not started.");
        const ls = new LocalVideoStream(videoTrack, {stopTrackWhenDisabled: false});
        if(!this.videoPub){
            this.videoPub = await this.me.publish(ls);
        } else{
            if(this.videoPub.stream?.track === videoTrack) return;
            this.videoPub.replaceStream(ls, {releaseOldStream: false});
        }
    }

    async start(){
        const context = await SkyWayContext.Create(createSkywayAuthToken(this.appId, this.secret));
        const room = await SkyWayRoom.FindOrCreate(
            context, {type: 'p2p', name: this.roomId});
        this.me = await room.join();
        console.log(`[SkyWay.start] joined to room ${this.roomId}, selfId: ${this.me.id}`);
        window.addEventListener("beforeunload", ()=>{
            this.me?.leave();
        });
        this.dispatchCustomEvent("connected", {selfPeerId: this.me.id});

        // 他のユーザの存在を通知する
        const firePeerArrived = (m: RoomMember)=>{
            if(!this.me) return;
            if (m.id === this.me.id) return;
            this.dispatchCustomEvent("peerArrived", {peerId: m.id});
        };
        // 他のユーザのpublicationをsubscribeする
        const subscribeAndAttach = async (publication: RoomPublication<LocalStream>) => {
            if(!this.me) return;
            const publisherId = publication.publisher.id;
            if (publisherId === this.me.id) return;
            const { stream } = await this.me.subscribe(publication.id);
            console.log(`[SkyWay] subscribe to peer ${publisherId}, streamType: ${stream.contentType}`);
            if(stream instanceof RemoteVideoStream || stream instanceof RemoteAudioStream){
                this.dispatchCustomEvent("peerStreamArrived", {
                    peerId: publisherId, track: stream.track, type: stream.contentType});
            }
        };
        room.members.forEach(firePeerArrived);
        room.publications.forEach(subscribeAndAttach);
        room.onMemberJoined.add((e) => firePeerArrived(e.member));
        room.onStreamPublished.add((e) => subscribeAndAttach(e.publication));
        room.onMemberLeft.add((e) => {
            if (e.member.id === this.me?.id) return;
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