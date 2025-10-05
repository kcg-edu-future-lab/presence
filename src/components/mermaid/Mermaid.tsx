import { useEffect, useRef } from "react";
import { YjsDocument } from "../common/model/YjsDocument";
import mermaid from "mermaid";
import { yCollab } from 'y-codemirror.next'
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { DelayedNotifier } from "../../util/DelayedNotifier";

interface Props{
    ydoc: YjsDocument;
}
export function Mermaid({ydoc}: Props){
    const first = useRef(true);
    const editorRef = useRef<HTMLDivElement>(null!);
    const viewRef = useRef<HTMLDivElement>(null!);
    useEffect(()=>{
        if(!first.current) return;
        first.current = false;
        // 初回だけmermaid, codemirrorをセットアップ
        mermaid.initialize({startOnLoad:false});
        const yt = ydoc.getYDoc().getText("mermaid");
        new EditorView({
            state: EditorState.create({
                extensions: [basicSetup, yCollab(yt, ydoc.awareness)]
            }),
            parent: editorRef.current
        });
        // YDocへの最後の更新から700ms待ってからmermaidに反映する(=700ms以内の連続する更新は無視する)。
        const n = new DelayedNotifier(700);
        n.addEventListener("notify", async ()=>{
            mermaid.render('dummy', yt.toJSON(), viewRef.current)
                .then(({svg})=>viewRef.current.innerHTML = svg);
        });
        ydoc.addEventListener("updated", ()=>n.notify());
        // 表示されたらmermaidを再描画
        const observer = new IntersectionObserver(entries => {
            if(entries.some(entry => entry.isIntersecting)){
                n.notify();
            }
        });
        observer.observe(editorRef.current);
    });

    return <div>
        <div ref={editorRef} style={{border: "1px solid"}} />
        <div data-role="view" ref={viewRef} />
    </div>;
}
