import { TypedCustomEventTarget } from "tcet";

/**
 * 最後のnotify呼び出しからdelayが経過した際にイベントを送出するクラス。
 */
export class DelayedNotifier extends TypedCustomEventTarget<DelayedNotifier, {notify: void}>{
    private timer: number = 0;
    private lastNotify = 0;
    private lastNotifyWhenTimerStarted = 0;
    constructor(private delay: number = 1000){
        super();
    }

    notify(){
        this.lastNotify = Date.now();
        if(this.timer != 0) return;
        this.startTimer(this.delay);
    }

    private startTimer(delay: number){
        this.timer = window.setTimeout(
            ()=>this.fireOrDelay(),
            delay);
        this.lastNotifyWhenTimerStarted = this.lastNotify;
    }

    private fireOrDelay(){
        if(this.lastNotify !== this.lastNotifyWhenTimerStarted){
            // タイマースタート時以降にnotifyが呼ばれていたら再度タイマー開始
            const d = this.delay - (Date.now() - this.lastNotify);
            this.startTimer(d);
            return;
        }
        this.dispatchCustomEvent("notify");
        this.timer = 0;
    }
}
