import { LocalJsonStorage } from "../../../util/LocalJsonStorage";
import { BeforeEnterRoom, EnterRoomAllowed, EnterRoomAllowedDetail, Madoi, PeerEntered, PeerEnteredDetail, PeerInfo, PeerLeaved, PeerLeavedDetail, PeerProfileUpdated, PeerProfileUpdatedDetail, ShareClass, TypedEventTarget } from "madoi-client";
import { AvatarModel } from "./AvatarModel";

export interface SelfNameChangedDetail{
    name: string;
}
export interface SelfPositionChangedDetail{
    position: [number, number];
}
@ShareClass({className: "VirtualRoomLocalModel"})
export class VirtualRoomOwnModel extends TypedEventTarget<VirtualRoomOwnModel, {
    selfNameChanged: SelfNameChangedDetail,
    selfPositionChanged: SelfPositionChangedDetail,
}>{
    private ls: LocalJsonStorage<{position: [number, number]}>;
    private self: AvatarModel;
    private others: Map<string, AvatarModel> = new Map();
    private madoi: Madoi | null = null;

    constructor(roomId: string, selfName: string, private initialSelfPosition: [number, number]){
        super();
        this.ls = new LocalJsonStorage(roomId);
        this.self = new AvatarModel("", selfName, 
            this.ls.get("position", initialSelfPosition));
    }

    get selfPeer(){
        return this.self;
    }

    get otherPeers(){
        return Array.from(this.others.values());
    }

    @BeforeEnterRoom()
    protected beforeEnterRoom(selfPeerProfile: {[key: string]: any}, madoi: Madoi){
        this.madoi = madoi;
        selfPeerProfile["position"] = this.selfPeer.position;
    }

    @EnterRoomAllowed()
    protected enterRoomAllowed({selfPeer, otherPeers}: EnterRoomAllowedDetail){
        this.self = this.createAvatarFromPeer(selfPeer);
        this.self.addEventListener("nameChanged", ({detail: {name}})=>{
            this.madoi?.updateSelfPeerProfile("name", name);
            this.dispatchCustomEvent("selfNameChanged", {name});
        });
        this.self.addEventListener("positionChanged", ({detail: {position}})=>{
            this.ls.set("position", position);
            this.madoi?.updateSelfPeerProfile("position", position);
            this.dispatchCustomEvent("selfPositionChanged", {position});
        });
        for(const p of otherPeers){
            this.others.set(p.id, this.createAvatarFromPeer(p));
        }
    }

    @PeerEntered()
    protected peerEntered({peer}: PeerEnteredDetail){
        this.others.set(peer.id, this.createAvatarFromPeer(peer));
    }

    @PeerProfileUpdated()
    protected peerProfileUpdated({peerId, updates}: PeerProfileUpdatedDetail){
        const peer = this.others.get(peerId);
        if(!peer || !updates) return;
        if(updates["name"]){
            peer.name = updates["name"];
        }
        if(updates["position"]){
            peer.position = updates["position"];
        }
    }

    @PeerLeaved()
    protected peerLeaved({peerId}: PeerLeavedDetail){
        this.others.delete(peerId);
    }

    private createAvatarFromPeer(p: PeerInfo){
        return new AvatarModel(
            p.id, p.profile["name"], p.profile["position"]);
    }
}
