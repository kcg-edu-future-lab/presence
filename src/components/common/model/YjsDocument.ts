import * as Y from 'yjs'
import { GetState, SetState, Madoi, Share, ShareClass } from "madoi-client";
import { TypedCustomEventListenerOrObject, TypedCustomEventTarget } from "tcet";
import { fromBase64, toBase64 } from '../../../util/Util';

interface YjsDocumentEvents{
    updated: void;
}
export type DocumentChangedListener = TypedCustomEventListenerOrObject<YjsDocument, void>;
@ShareClass({className: "YjsDocument"})
export class YjsDocument extends TypedCustomEventTarget<YjsDocument, YjsDocumentEvents>{
    private ydoc: Y.Doc;

    constructor (private madoi: Madoi){
        super();
        this.ydoc = new Y.Doc();
        this.ydoc.on("update", (update, origin)=>{
            // 自身がY.applyUpdateした場合はoriginがthisになる。その場合は無視する。
            if(origin === this) return;
            // 他の、ydocデータへの変更(codemirror等での変更含む)の場合はthis.applyUpdate
            // メソッド(共有メソッド)を呼び出す。
            this.applyUpdate(toBase64(update));
        });
    }

    getYDoc(){
        return this.ydoc;
    }

    // メソッド実行後に他のピアに共有メッセージを送る。
    @Share({type: "afterExec"})
    private applyUpdate(update: string){
        // メッセージの処理中(=他のピアからのメッセージによるメソッド実行)であればydocへ反映する。
        // ydocデータへの他の変更の場合(codemirrorのUIからの変更を想定)はupdatedイベント発行のみ。
        if(this.madoi.isMessageProcessing()){
            Y.applyUpdate(this.ydoc, fromBase64(update), this);
        }
        this.dispatchCustomEvent("updated");
    }

    @GetState()
    getSnapshot(){
        return toBase64(Y.encodeStateAsUpdate(this.ydoc))
    }

    @SetState()
    setSnapshot(state: string){
        Y.applyUpdate(this.ydoc, fromBase64(state), this);
        this.dispatchCustomEvent("updated");
    }
}
