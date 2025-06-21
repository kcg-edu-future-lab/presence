
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
