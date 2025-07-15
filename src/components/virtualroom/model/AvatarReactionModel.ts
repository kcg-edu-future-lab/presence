import { Share, ShareClass, TypedEventListenerOrEventListenerObject, TypedEventTarget } from "madoi-client";

export interface AvatarReactionDetail{
    avatarId: string;
    reaction: string;
}
export type AvatarReactionListener = TypedEventListenerOrEventListenerObject<AvatarReactionModel, AvatarReactionDetail>;
@ShareClass({className: "AvatarReactionModel"})
export class AvatarReactionModel extends TypedEventTarget<AvatarReactionModel, {reaction: AvatarReactionDetail}>{
    @Share({maxLog: 0})
    doReaction(avatarId: string, reaction: string){
        this.dispatchCustomEvent("reaction", {avatarId, reaction});
    }
}
