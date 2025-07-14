import { TypedEventListener, TypedEventTarget } from "madoi-client";
import { VirtualBackground } from "./VirtualBackground";

export interface StreamCreatedDetail{
    stream: MediaStream;
    cameraOn: boolean;
    micOn: boolean;
}
export type StreamCreatedListener = TypedEventListener<StreamManager, StreamCreatedDetail>;
export interface StreamUpdatedDetail{
    stream: MediaStream;
    cameraOn: boolean;
    micOn: boolean;
}
export type StreamUpdatedListener = TypedEventListener<StreamManager, StreamUpdatedDetail>;
export class StreamManager extends TypedEventTarget<StreamManager, {
    streamCreated: StreamCreatedDetail,
    streamUpdated: StreamUpdatedDetail,
    streamDestroyed: void
}>{
    get cameraOn(): boolean{
        return false;
    }

    get micOn(): boolean{
        return false;
    }

    get stream(): MediaStream | null{
        return null;
    }
}

/**
 * 利用者のメディアストリームを管理するクラス。
 * 自撮り画像のストリームと送信用ストリームの作成・更新・廃棄を通知する。
 */
export class UserMediaStreamManager extends StreamManager{
    private _micOn = false;
    private _cameraOn = false;
    private _stream: MediaStream | null = null;

    get micOn(){
        return this._micOn;
    }

    get cameraOn(){
        return this._cameraOn;
    }

    get stream(): MediaStream | null{
        return this._stream;
    }

    setStates(micOn: boolean, cameraOn: boolean, ){
        this.updateMediaStream(micOn, cameraOn);
    }

    setMicState(on: boolean){
        this.updateMediaStream(on, this._cameraOn);
    }

    setCameraState(on: boolean){
        this.updateMediaStream(this._micOn, on);
    }

    acquire(){
        navigator.mediaDevices
            .getUserMedia({audio: true, video: true})
            .then(stream=>{
                stream.getAudioTracks().forEach(t => t.enabled = false);
                stream.getVideoTracks().forEach(t => t.enabled = false);
                this._stream = stream;
                this._micOn = false;
                this._cameraOn = false;
                this.dispatchCustomEvent("streamCreated", {stream, micOn: false, cameraOn: false});
            });
    }

    private async updateMediaStream(micOn: boolean, cameraOn: boolean){
        if(this.micOn === micOn && this.cameraOn === cameraOn) return;
        if(this._stream === null){
            if(!micOn && !cameraOn) return;
            return;
        }
        if(this.cameraOn !== cameraOn){
            this._stream.getVideoTracks().forEach(t=>t.enabled = cameraOn);
        }
        if(this.micOn !== micOn){
            this._stream.getAudioTracks().forEach(track => track.enabled = micOn);
        }
        this._micOn = micOn;
        this._cameraOn = cameraOn;
        this.dispatchCustomEvent("streamUpdated", {stream: this._stream, cameraOn, micOn});
    }
}

export class VirtualBackgroundStreamManager extends StreamManager{
    private cameraWidth = 0;
    private cameraHeight = 0;
    private sourceSM: StreamManager | null = null;
    private sourceVideo: HTMLVideoElement;
    private vb: VirtualBackground;
    private canvas: HTMLCanvasElement;
    private canvasStream: MediaStream;
    private outputStream: MediaStream;
    private prevTime = 0;

    constructor(vbImage: string = "./defaultBackground.png"){
        super();
        this.outputStream = new MediaStream();
        this.vb = new VirtualBackground(vbImage);

        const v = document.createElement("video");
        v.muted = true;
        v.width = 100;
        v.height = 100;
        this.sourceVideo = v;

        const c = document.createElement("canvas");
        c.width = 100;
        c.height = 100;
        this.canvas = c;
        this.canvasStream = this.canvas.captureStream();
    }

    get micOn(){
        return this.sourceSM?.micOn || false;
    }

    get cameraOn(){
        return this.sourceSM?.cameraOn || false;
    }

    get stream(){
        return this.outputStream;
    }

    attach(sm: StreamManager){
        this.sourceSM = sm;
        sm.addEventListener("streamCreated", ({detail: {stream, cameraOn, micOn}})=>{
            this.setupVbStream(stream)!;
            if(cameraOn) requestAnimationFrame(()=>this.drawVbImage());
            this.dispatchCustomEvent("streamCreated", {stream: this.outputStream, cameraOn, micOn});
        });

        sm.addEventListener("streamUpdated", ({detail: {stream, cameraOn, micOn}})=>{
            if(cameraOn){
                requestAnimationFrame(()=>this.drawVbImage());
            } else{
                const ctx = this.canvas.getContext("2d")!;
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            this.dispatchCustomEvent("streamUpdated", {stream: this.outputStream, cameraOn, micOn});
        });

        sm.addEventListener("streamDestroyed", ()=>{
            this.dispatchCustomEvent("streamDestroyed");
        });
    }

    private setupVbStream(stream: MediaStream){
        stream.getAudioTracks().forEach(t=>this.outputStream.addTrack(t));

        const {width: cw, height: ch} = stream.getVideoTracks()[0].getSettings();
        if(!cw || !ch){
            console.error("カメラサイズが取得できません。");
            return;
        }
        this.cameraWidth = cw;
        this.cameraHeight = ch;
        const v = this.sourceVideo;
        v.width = cw / 2;
        v.height = ch / 2;
        v.srcObject = stream;
        // display: "none" の場合はautoplay=trueでもplay()が必要
        v.play();

        const c = this.canvas;
        c.width = cw / 2;
        c.height = ch / 2;

        this.canvasStream.getVideoTracks().forEach(t=>this.outputStream.addTrack(t));
    }

    private drawVbImage(){
        if(!this.cameraOn) return;
        if (Date.now() - this.prevTime > 60 && this.sourceVideo.currentTime !== 0) {
            this.prevTime = Date.now();
            this.vb.update(this.sourceVideo, this.cameraWidth, this.cameraHeight, this.canvas);
        }
        requestAnimationFrame(()=>this.drawVbImage());
    }
}

export class TakingplaceScreenStreamManager extends StreamManager{
    private _enabled = false;
    private sourceSM: StreamManager | null = null;
    private outputStream: MediaStream;

    onScreenShareStopped?: ()=>void;

    constructor(){
        super();
        this.outputStream = new MediaStream();
    }

    get enabled(){
        return this._enabled;
    }

    get micOn(){
        return this.sourceSM?.micOn || false;
    }

    get cameraOn(){
        return this.sourceSM?.cameraOn || false;
    }

    get stream(): MediaStream | null{
        return this._enabled ? this.outputStream : this.sourceSM?.stream || null;
    }

    async setEnabled(enabled: boolean){
        if(this._enabled !== enabled){
            if(enabled){
                await this.startScreenSharing();
            } else{
                this.stopScreenSharing();
            }
        }
        return this._enabled;
    }

    attach(sm: StreamManager){
        this.sourceSM = sm;
        sm.addEventListener("streamCreated", ({detail: {stream, cameraOn, micOn}})=>{
            this.dispatchCustomEvent("streamCreated", {stream, cameraOn, micOn});
        });
        sm.addEventListener("streamUpdated", ({detail: {stream, cameraOn, micOn}})=>{
            if(!this._enabled){
                this.dispatchCustomEvent("streamUpdated", {stream, cameraOn, micOn});
            }
        });
        sm.addEventListener("streamDestroyed", ()=>{
            if(!this._enabled){
                this.dispatchCustomEvent("streamDestroyed");
            }
        });
    }

    private async startScreenSharing(){
        if(this._enabled) return;
        if(!this.sourceSM || !this.sourceSM.stream){
            throw new Error("Illegal State");
        }
        try{
            const s: MediaStream = await (navigator.mediaDevices as any).getDisplayMedia({
                audio: false, video: true });
            s.getVideoTracks().find(()=>true)?.addEventListener("ended", ()=>{
                this.stopScreenSharing();
            });
            const stream = new MediaStream();
            stream.addTrack(s.getVideoTracks()[0]);
            stream.addTrack(this.sourceSM.stream.getAudioTracks()[0]);
            this.outputStream = stream;
            this.dispatchCustomEvent("streamUpdated", {
                stream,
                micOn: this.sourceSM.micOn,
                cameraOn: this.sourceSM.cameraOn});
            this._enabled = true;
        } catch(_){
            console.log("failed to share screen.");
        }
    }

    private stopScreenSharing(){
        if(!this._enabled) return;
        if(this.onScreenShareStopped) this.onScreenShareStopped();
        this._enabled = false;
        if(!this.sourceSM || !this.sourceSM.stream){
            throw new Error("Illegal State");
        }
        this.outputStream.getVideoTracks().forEach(t => t.stop());
        this.outputStream = new MediaStream();
        this.dispatchCustomEvent("streamUpdated", {
            stream: this.sourceSM.stream,
            micOn: this.sourceSM.micOn,
            cameraOn: this.sourceSM.cameraOn});
    }
}
