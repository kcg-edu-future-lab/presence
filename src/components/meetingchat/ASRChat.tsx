import { useEffect } from "react";
import { ChatLogs } from "./model/ChatLogs";
import { ASREngine, ASRResultListener } from "../../util/ASREngine";
import { Chat } from "./Chat";
import { ASR } from "./ASR";

interface Props{
    selfName: string;
    asr: ASREngine;
    chatLogs: ChatLogs;
}
export function ASRChat({selfName, asr, chatLogs}: Props){
    const onChat = (sentence: string)=>{
        chatLogs.add(selfName, "ja", sentence);
    }
    const onAsrResults: ASRResultListener = ({detail: {results}}) =>{
        const message = results.join("\n");
        if(message.length == results.length - 1) return;
        chatLogs.add(`${selfName}[音声認識]`, asr.getLanguage(), message);
    };

    useEffect(()=>{
        asr.addEventListener("results", onAsrResults);
        return ()=>{
            asr.removeEventListener("results", onAsrResults);
        };
    }, []);

    return <>
        <Chat logs={chatLogs} onChat={onChat} />
        <ASR engine={asr} />
    </>;
}