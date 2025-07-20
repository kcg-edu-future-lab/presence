import { TypedCustomEventListenerOrObject, TypedCustomEventTarget } from "tcet";
import { SkyWay } from "../../../util/SkyWay";

export interface MadoiIdChangedDetail{
    madoiId: string;
}
export type MadoiIdChangedListener = TypedCustomEventListenerOrObject<SelfPeerModel, MadoiIdChangedDetail>;
export interface NameChangedDetail{
    name: string;
}
export type NameChangedListener = TypedCustomEventListenerOrObject<SelfPeerModel, NameChangedDetail>;
export interface SkyWayIdChangedDetail{
    skyWayId: string;
}
export type SkyWayIdChangedListener = TypedCustomEventListenerOrObject<SelfPeerModel, SkyWayIdChangedDetail>;
export class SelfPeerModel extends TypedCustomEventTarget<SelfPeerModel, {
    madoiIdChanged: MadoiIdChangedDetail,
    nameChanged: NameChangedDetail,
    skyWayIdChanged: SkyWayIdChangedDetail
}>{
    private _madoiId?: string;
    private _name?: string;
    private _skyWayId?: string;

    constructor(skyWay: SkyWay){
        super();
        skyWay.addEventListener("connected", ({detail: {selfPeerId}})=>{
            this._skyWayId = selfPeerId;
        });
    }

    get madoiId(): string | undefined{
        return this._madoiId;
    }

    set madoiId(madoiId: string){
        this._madoiId = madoiId;
        this.dispatchCustomEvent("madoiIdChanged", {madoiId});
    }

    get name(): string | undefined{
        return this._name;
    }

    set name(name: string){
        this._name = name;
        this.dispatchCustomEvent("nameChanged", {name});
    }

    get skyWayId(): string | undefined{
        return this._skyWayId;
    }

    set skyWayId(skyWayId: string){
        this._skyWayId = skyWayId;
        this.dispatchCustomEvent("skyWayIdChanged", {skyWayId});
    }
}
