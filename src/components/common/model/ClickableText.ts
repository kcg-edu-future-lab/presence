import { Notify, ShareClass, TypedEventListenerOrEventListenerObject, TypedEventTarget } from "madoi-client";

export interface ClickDetail{
    text: string;
}
export type ClickListener = TypedEventListenerOrEventListenerObject<ClickeableText, ClickDetail>;

@ShareClass({className: "ClickeableText"})
export class ClickeableText
extends TypedEventTarget<ClickeableText, {
    click: ClickDetail}
>{
    @Notify()
    click(text: string): void{
        this.dispatchCustomEvent("click", {text});
    }
}
