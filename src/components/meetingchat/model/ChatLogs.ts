import { GetState, SetState, Share, ShareClass } from "madoi-client";
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
    private logs: Log[] = [];

    constructor(){
        super();
    }

    add(senderName: string, language: string, message: string) {
        this.addLog(senderName, language, message);
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
