import { TypedCustomEventTarget } from "tcet";
import { StreamCreatedDetail, StreamUpdatedDetail, TakingplaceScreenStreamManager, UserMediaStreamManager, VirtualBackgroundStreamManager } from "./StreamManagers";

export class MediaManager extends TypedCustomEventTarget<MediaManager, {
    userStreamCreated: StreamCreatedDetail;
    userStreamUpdated: StreamUpdatedDetail;
    screenShareStopped: void;
}>{
    private userMediaSM = new UserMediaStreamManager();
    private virtualBGSM: VirtualBackgroundStreamManager;
    private screenShareSM = new TakingplaceScreenStreamManager();

    constructor(vbImagePath: string){
        super();
        this.virtualBGSM = new VirtualBackgroundStreamManager(vbImagePath);
    }

    getScreenShareSM(){
        return this.screenShareSM;
    }

    start(){
        console.log("mediaManager.start");
        this.virtualBGSM.attach(this.userMediaSM);
        this.screenShareSM.attach(this.virtualBGSM);
        this.screenShareSM.addEventListener("streamCreated", ({detail})=>{
            this.dispatchCustomEvent("userStreamCreated", detail);
        });
        this.screenShareSM.addEventListener("streamUpdated", ({detail})=>{
            this.dispatchCustomEvent("userStreamUpdated", detail);
        });
        this.screenShareSM.onScreenShareStopped = ()=>{
            this.dispatchCustomEvent("screenShareStopped");
        };
    }

    async setMicEnabled(value: boolean){
        await this.userMediaSM.setMicState(value);
    }
    async setCameraEnabled(value: boolean){
        await this.userMediaSM.setCameraState(value);
    }
    isScreenShareEnabled(){
        return this.screenShareSM.enabled;
    }
    async setScreenShareEnabled(value: boolean){
       return await this.screenShareSM.setEnabled(value);
    }
}
