
export function getLastPath(url: string){
    if(url.indexOf("?") != -1) url = url.substring(0, url.indexOf("?"));
    if(url == "/") url = "";
    return url.replace(/[\/:]/g, "_").split("#")[0];
}

export function computeIfAbsentMap<T, U>(map: Map<T, U>, key: T, comp: Function): U{
    let ret = map.get(key);
    if(ret != null){
        return ret;
    }
    const value = comp(key);
    map.set(key, value);
    return value;
}

export function copyTextToClipboard(content: string){
    const item = new ClipboardItem({
        "text/plain": content
    });
    navigator.clipboard.write([item]);
}

export function downloadTextByAnchorTag(filename: string, content: string){
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
        new Blob([content],
            { type: "text/plain"}));
    a.setAttribute("download", filename);
    a.dispatchEvent(new MouseEvent("click"));
}

export function copyCanvasImageToClipboard(
    canvas: HTMLCanvasElement, contentType: string = "image/png"){
    canvas.toBlob(blob=>{
        const content: {[key: string]: Blob} = {};
        content[contentType] = blob!;
        const item = new ClipboardItem(content);
        navigator.clipboard.write([item]);
    });
}

export function downloadCanvasImageByAnchorTag(
    filename: string, canvas: HTMLCanvasElement, contentType: string = "image/png"){
    const a = document.createElement("a");
    a.href = canvas.toDataURL(contentType);
    a.setAttribute("download", filename);
    a.dispatchEvent(new MouseEvent("click"));
}
