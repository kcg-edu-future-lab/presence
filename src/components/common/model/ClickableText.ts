import { Share, ShareClass, TypedEventListenerOrEventListenerObject, TypedEventTarget } from "madoi-client";

export interface ClickDetail{
    text: string;
}
export type ClickListener = TypedEventListenerOrEventListenerObject<ClickeableText, ClickDetail>;

@ShareClass({className: "ClickeableText"})
export class ClickeableText
extends TypedEventTarget<ClickeableText, {
    click: ClickDetail}
>{
    @Share({maxLog: 0})
    click(text: string): void{
        this.dispatchCustomEvent("click", {text});
    }
}
