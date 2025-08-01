import { EnterRoomAllowed, EnterRoomAllowedDetail, GetState, Madoi, PeerProfileUpdated, PeerProfileUpdatedDetail, SetState, Share, ShareClass } from "madoi-client";
import { TypedCustomEventTarget } from "tcet";

const ignoreWords = new Set<string>(["そう"]);

export interface Word{
    surface: string;
    type: "NOUN" | "LINK" | "OTHER";
}
export interface Log{
    senderName: string;
    language: string;
    sentence: string;
}
export interface LogAddedDetail{
    sentence: string;
}
@ShareClass({className: "ChatLogs"})
export class ChatLogs extends TypedCustomEventTarget<ChatLogs, {
    logAdded: LogAddedDetail
}>{
    private selfName: string = "匿名";
    private logs: Log[] = [];

    constructor(){
        super();
    }

    @EnterRoomAllowed()
    protected enterRoomAllowed({selfPeer}: EnterRoomAllowedDetail, madoi: Madoi){
        this.selfName = selfPeer.profile["name"] || "匿名";
    }   

    @PeerProfileUpdated()
    protected peerProfileUpdated({peerId, updates}: PeerProfileUpdatedDetail, madoi: Madoi){
        if(peerId === madoi.getSelfPeerId() && updates && updates["name"]){
            this.selfName = updates["name"];
        } 
    }

    addAsrResult(language: string, message: string) {
        this.add(`${this.selfName}[音声認識]`, language, message);
    }

    addInputText(language: string, message: string) {
        this.add(this.selfName, language, message);
    }

    private add(selfName: string, language: string, message: string) {
        this.addLog(selfName, language, message);
    }

    @Share()
    private addLog(senderName: string, language: string, sentence: string){
        this.logs = [...this.logs, {senderName, language, sentence}];
        this.dispatchCustomEvent("logAdded", {sentence});
    }

    @GetState()
    getLogs(){
        return this.logs;
    }

    @SetState()
    setLogs(logs: Log[]){
        this.logs = logs;
    }
}
