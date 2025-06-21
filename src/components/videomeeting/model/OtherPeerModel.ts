import { TypedEventListener, TypedEventTarget } from "madoi-client";

export interface NameChangedDetail{
    name: string;
}
export type NameChangedListener = TypedEventListener<OtherPeerModel, NameChangedDetail>;
export interface VolumeChangedDetail{
    volume: number;
}
export type VolumeChangedListener = TypedEventListener<OtherPeerModel, VolumeChangedDetail>;
export interface SkyWayIdChangedDetail{
    skyWayId: string;
}
export type SkyWayIdChangedListener = TypedEventListener<OtherPeerModel, SkyWayIdChangedDetail>;
export interface StreamChangedDetail{
    stream: MediaStream;
}
export type StreamChangedListener = TypedEventListener<OtherPeerModel, StreamChangedDetail>;
export class OtherPeerModel extends TypedEventTarget<OtherPeerModel, {
    nameChanged: NameChangedDetail,
    volumeChanged: VolumeChangedDetail,
    skyWayIdChanged: SkyWayIdChangedDetail,
    streamChanged: StreamChangedDetail
}>{
    _stream = new MediaStream();

    constructor(private _madoiId: string, private _name: string, private _skyWayId: string, private _volume: number = 1){
        super();
    }

    get madoiId(){
        return this._madoiId;
    }

    get name(){
        return this._name;
    }

    set name(_name: string){
        this._name = _name;
        this.dispatchCustomEvent("nameChanged", {name: _name});
    }

    get skyWayId(): string | undefined{
        return this._skyWayId;
    }

    set skyWayId(_skyWayId: string){
        this._skyWayId = _skyWayId;
        this.dispatchCustomEvent("skyWayIdChanged", {skyWayId: _skyWayId});
    }

    get stream(): MediaStream{
        return this._stream;
    }

    set volume(volume: number){
        if(Math.abs(this._volume - volume) < 0.0001) return;
        this._volume = volume;
        this.dispatchCustomEvent("volumeChanged", {volume});
    }

    addTrack(track: MediaStreamTrack){
        const stream = new MediaStream();
        this._stream.getTracks().forEach(t=>stream.addTrack(t));
        stream.addTrack(track);
        this._stream = stream;
        this.dispatchCustomEvent("streamChanged", {stream});
    }
}
