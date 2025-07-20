import { Notify, ShareClass } from "madoi-client";
import { TypedCustomEventListenerOrObject, TypedCustomEventTarget } from "tcet";

export interface AvatarReactionDetail{
    avatarId: string;
    reaction: string;
}
export type AvatarReactionListener = TypedCustomEventListenerOrObject<AvatarReactionModel, AvatarReactionDetail>;
@ShareClass({className: "AvatarReactionModel"})
export class AvatarReactionModel extends TypedCustomEventTarget<AvatarReactionModel, {reaction: AvatarReactionDetail}>{
    @Notify()
    doReaction(avatarId: string, reaction: string){
        this.dispatchCustomEvent("reaction", {avatarId, reaction});
    }
}
