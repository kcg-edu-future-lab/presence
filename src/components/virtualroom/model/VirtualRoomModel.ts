import { LocalJsonStorage } from "../../../util/LocalJsonStorage";
import { GetState, SetState, ShareClass, TypedEventTarget } from "madoi-client";

export interface BackgroundChangedDetail{
    background: string;
}
@ShareClass({className: "VirtualRoomModel"})
export class VirtualRoomModel extends TypedEventTarget<VirtualRoomModel, {
    backgroundChanged: BackgroundChangedDetail
}>{
    private ls: LocalJsonStorage<{background: string}>;
    private _background: string;

    constructor(roomId: string, defaultBackground: string){
        super();
        this.ls = new LocalJsonStorage(roomId);
        this._background = this.ls.get("background", defaultBackground);
    }

    get background(){
        return this._background;
    }

    set background(background: string){
        this._background = background;
        this.dispatchCustomEvent("backgroundChanged", {background});
    }

    @GetState()
    getState(){
        return {background: this._background};
    }

    @SetState()
    setState({background}: {background: string}){
        this._background = background;
        this.dispatchCustomEvent("backgroundChanged", {background});
        this.ls.set("background", background);
    }
}
