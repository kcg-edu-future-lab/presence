import { ClassName, Distributed } from "madoi-client";
import { TypedCustomEventListenerOrObject, TypedCustomEventTarget } from "tcet";

export interface AvatarReactionDetail{
    avatarId: string;
    reaction: string;
}
export type AvatarReactionListener = TypedCustomEventListenerOrObject<AvatarReactionModel, AvatarReactionDetail>;
@ClassName("AvatarReactionModel")
export class AvatarReactionModel extends TypedCustomEventTarget<AvatarReactionModel, {reaction: AvatarReactionDetail}>{
    @Distributed({serialized: false})
    doReaction(avatarId: string, reaction: string){
        this.dispatchCustomEvent("reaction", {avatarId, reaction});
    }
}
