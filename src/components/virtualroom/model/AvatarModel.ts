import { TypedCustomEventTarget } from "tcet";

export interface NameChangedDetail{
    name: string;
}
export interface TranslatedDetail{
    position: [number, number];
}
export class AvatarModel extends TypedCustomEventTarget<AvatarModel, {
    nameChanged: NameChangedDetail,
    positionChanged: TranslatedDetail
}>{
    constructor(private _id: string, private _name: string,
            private _position: [number, number]){
        super();
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

    set name(name: string){
        this._name = name;
        this.dispatchCustomEvent("nameChanged", {name});
    }

    get position(){
        return this._position;
    }

    set position(position: [number, number]){
        this._position = position;
        this.dispatchCustomEvent("positionChanged", {position: this._position});
    }

    translate(dx: number, dy: number){
        this._position[0] += dx;
        this._position[1] += dy;
        this.dispatchCustomEvent("positionChanged", {position: this._position});
    }
}