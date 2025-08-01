import { EnterRoomAllowed, EnterRoomAllowedDetail, PeerEntered, PeerEnteredDetail, PeerInfo, PeerLeaved, PeerLeavedDetail, PeerProfileUpdated, PeerProfileUpdatedDetail, ShareClass } from "madoi-client";
import { AvatarModel } from "./AvatarModel";

@ShareClass({className: "VirtualRoomLocalModel"})
export class VirtualRoomOwnModel {
    private self: AvatarModel;
    private others: Map<string, AvatarModel> = new Map();

    constructor(){
        this.self = new AvatarModel("", "", [0, 0]);
    }

    get selfAvatar(){
        return this.self;
    }

    get otherAvatars(){
        return Array.from(this.others.values());
    }

    @EnterRoomAllowed()
    protected enterRoomAllowed({selfPeer, otherPeers}: EnterRoomAllowedDetail){
        this.self = this.createAvatarFromPeer(selfPeer);
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
        let avatar: AvatarModel | undefined = this.self;
        if(this.self.id !== peerId){
            avatar = this.others.get(peerId);
        }
        if(!avatar || !updates) return;
        if(updates["name"]) avatar.name = updates["name"];
        else if(updates["position"]) avatar.position = updates["position"];
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
