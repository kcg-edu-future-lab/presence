import { FormEventHandler, useEffect, useRef } from "react";
import { Box, Button, Grid, IconButton, TextField } from "@mui/material";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ChatLogs, Log } from "./model/ChatLogs";
import { copyTextToClipboard, downloadTextByAnchorTag } from "../../util/Util";

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
    const onCopyClick: FormEventHandler = e=>{
        e.preventDefault();
        copyTextToClipboard(chatLogsToText(logs.getLogs()));
    };
    const onDownloadClick: FormEventHandler = e=>{
        e.preventDefault();
        downloadTextByAnchorTag("chat.txt", chatLogsToText(logs.getLogs()));
    };

    useEffect(()=>{
        const d = chatLogDivRef.current;
        d.scrollTo({
            top: d.scrollHeight,
            behavior: 'smooth'
        });
    });

    return <Grid container>
        <Grid size={10}>
            <form onSubmit={onSubmit}>
                <div>
                    <TextField size="small" inputRef={sentenceInputRef} />
                    <Button type="submit">送信</Button>
                </div>
            </form>
        </Grid>
        <Grid size={2}>
            <Box display="flex" justifyContent="flex-end">
                <IconButton onClick={onCopyClick}>
                    <ContentCopyIcon/>
                </IconButton>
                <IconButton onClick={onDownloadClick}>
                    <CloudDownloadIcon/>
                </IconButton>
            </Box>
        </Grid>
        <Grid size={12}>
            <div ref={chatLogDivRef} style={{overflow: "scroll", resize: "vertical",
                height: "200px", border: "solid 1px", padding: 4, borderRadius: "4px"}}>
                <span>
                    { logs.getLogs().map((l, li)=><div key={li}>
                        <span>{l.senderName}</span>:&nbsp;
                    { l.sentence }
                    </div>)}
                </span>
            </div>
        </Grid>
    </Grid>;
}

function chatLogsToText(logs: Log[]){
    return logs.reduce((prev, current)=>
        prev + `[${current.senderName}] ${current.sentence}\n`, "");
}
