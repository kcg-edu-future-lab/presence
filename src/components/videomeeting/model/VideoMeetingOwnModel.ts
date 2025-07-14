import { BeforeEnterRoom, EnterRoomAllowed, EnterRoomAllowedDetail, Madoi, PeerEntered, PeerEnteredDetail, PeerLeaved, PeerLeavedDetail, PeerProfileUpdated, PeerProfileUpdatedDetail, ShareClass, TypedEventTarget } from "madoi-client";
import { SkyWay } from "../../../util/SkyWay";
import { OtherPeerModel } from "./OtherPeerModel";
import { SelfPeerModel } from "./SelfPeerModel";

interface PeerStream{
    peerId: string;
    track: MediaStreamTrack;
    type: "audio" | "video";
}
export interface ConnectedDetail{
    skyWayPeerId: string;
}
@ShareClass({className: "VideoMeetingOwnModel"})
export class VideoMeetingOwnModel
extends TypedEventTarget<VideoMeetingOwnModel, {connected: ConnectedDetail}>{
    private madoi?: Madoi;
    private unattachedSkyWayPeerStreams: PeerStream[] = [];
    private _self?: SelfPeerModel;
    private _others: OtherPeerModel[] = [];

    constructor(skyWay?: SkyWay){
        super();
        if(skyWay){
            this._self = new SelfPeerModel(skyWay);
            skyWay.addEventListener("connected", ({detail: {selfPeerId}})=>{
                if(this.madoi){
                    this.madoi.updateSelfPeerProfile("skyWayPeerId", selfPeerId);
                }
                this.dispatchCustomEvent("connected", {skyWayPeerId: selfPeerId});
            });
            skyWay.addEventListener("peerStreamArrived", ({detail: {peerId, track, type}})=>
                this.peerStreamTrackArrived(peerId, track, type));
        }
    }

    get selfPeer(){
        return this._self;
    }

    get otherPeers(){
        return this._others;
    }

    findOtherPeer(madoiPeerId: string){
        return this._others.find(p=>p.madoiId === madoiPeerId);
    }

    @BeforeEnterRoom()
    protected beforeEnterRoom(selfPeerProfile: {[key: string]: any}, madoi: Madoi){
        if(this._self?.skyWayId) selfPeerProfile["skyWayPeerId"] = this._self.skyWayId;
        this.madoi = madoi;
    }

    @EnterRoomAllowed()
    protected enterRoomAllowed({selfPeer, otherPeers}: EnterRoomAllowedDetail){
        if(!this._self) return;
        this._self.madoiId = selfPeer.id;
        this._self.name = selfPeer.profile["name"];
        this._others = otherPeers.map(p=>{
            const ret = new OtherPeerModel(p.id,
                p.profile["name"],
                p.profile["skyWayPeerId"]
                );
            this.attachStreamIfPeerAvailable(ret);
            return ret;
        });
    }

    private attachStreamIfPeerAvailable(peer: OtherPeerModel){
        const sp = this.unattachedSkyWayPeerStreams.find(skp=>skp.peerId===peer.skyWayId);
        if(!sp) return;
        peer.stream.addTrack(sp.track);
        this.unattachedSkyWayPeerStreams =
            this.unattachedSkyWayPeerStreams.filter(skp=>skp.peerId!==peer.skyWayId);
    }

    @PeerEntered()
    protected peerEntered({peer}: PeerEnteredDetail){
        const p = new OtherPeerModel(peer.id, peer.profile["name"],
            peer.profile["skyWayPeerId"]);
        this._others = [...this._others, p];
        this.attachStreamIfPeerAvailable(p);
    }

    @PeerProfileUpdated()
    protected peerProfileUpdated({peerId, updates}: PeerProfileUpdatedDetail){
        if(!updates) return;
        const p = this._others.find(p=>p.madoiId===peerId);
        if(!p) return;
        if(updates["name"]){
            p.name = updates["name"];
        } else if(updates["skyWayPeerId"]){
            p.skyWayId = updates["skyWayPeerId"];
            this.attachStreamIfPeerAvailable(p);
        }
    }

    @PeerLeaved()
    protected peerLeaved({peerId}: PeerLeavedDetail){
        this._others = this._others.filter(p=>p.madoiId !== peerId);
    }

    private peerStreamTrackArrived(skyWayPeerId: string, track: MediaStreamTrack, type: "audio" | "video"){
        const other = this._others.find(p=>p.skyWayId === skyWayPeerId);
        if(other){
            other.addTrack(track);
        } else{
            this.unattachedSkyWayPeerStreams.push({peerId: skyWayPeerId, track, type});
        }
    }
}
