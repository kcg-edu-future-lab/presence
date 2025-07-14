import { FormEventHandler, useEffect, useRef } from "react";
import { Button, TextField } from "@mui/material";
import { ChatLogs } from "./model/ChatLogs";

interface Props {
  logs: ChatLogs;
  onChat: (sentence: string)=>void;
}
export function Chat({logs, onChat}: Props){
  const sentenceInputRef = useRef<HTMLInputElement>(null!);
  const chatLogDivRef = useRef<HTMLDivElement>(null!);
  const onSubmit: FormEventHandler = e=>{
    e.preventDefault();
    const sentence = sentenceInputRef.current.value.trim();
    if(sentence.length == 0) return;
    onChat(sentenceInputRef.current.value);
    sentenceInputRef.current.value = "";
  };
  useEffect(()=>{
    //chatLogDivRef.current.scrollIntoView();
  });
  return <div>
    <form onSubmit={onSubmit}>
      <div>
        <TextField size="small" inputRef={sentenceInputRef} />
        <Button type="submit">送信</Button>
      </div>
    </form>
    <div ref={chatLogDivRef} style={{overflow: "scroll", resize: "vertical",
        height: "200px", border: "solid 1px", padding: 4, borderRadius: "4px"}}>
      <span>
        { logs.getLogs().map((l, li)=><div key={li}>
          <span>{l.senderName}</span>:&nbsp;
          { l.sentence }
        </div>)}
      </span>
    </div>
  </div>;
}
