import { Notify, ShareClass } from "madoi-client";
import { TypedCustomEventListenerOrObject, TypedCustomEventTarget } from "tcet";

export interface ClickDetail{
    text: string;
}
export type ClickListener = TypedCustomEventListenerOrObject<ClickeableText, ClickDetail>;

@ShareClass({className: "ClickeableText"})
export class ClickeableText
extends TypedCustomEventTarget<ClickeableText, {
    click: ClickDetail}
>{
    @Notify()
    click(text: string): void{
        this.dispatchCustomEvent("click", {text});
    }
}
