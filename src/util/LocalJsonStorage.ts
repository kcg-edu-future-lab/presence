export class LocalJsonStorage<Items extends Record<string, any>>{
    constructor(private keyPrefix: string){
    }

    get<K extends keyof Items>(
        name: K, defaultValue?: Items[K] | (()=>Items[K])): Items[K];
    get(name: string, defaultValue: any) {
        const key = `${this.keyPrefix}:${name}`;
        let ret = JSON.parse(localStorage.getItem(key) || "null");
        if(ret !== null) return ret;
        if(!defaultValue) return defaultValue;
        ret = defaultValue;
        if(typeof ret === 'function') ret = ret();
        localStorage.setItem(key, JSON.stringify(ret));
        return ret;
    }

    set<K extends keyof Items>(
        name: K, value: Items[K]): void;
    set(name: string, value: any){
        const key = `${this.keyPrefix}:${name}`;
        localStorage.setItem(key, JSON.stringify(value));
    }
}
