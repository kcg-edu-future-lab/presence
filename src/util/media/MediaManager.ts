import { StreamCreatedDetail, StreamCreatedListener, StreamUpdatedListener, TakingplaceScreenStreamManager, UserMediaStreamManager, VirtualBackgroundStreamManager } from "./StreamManagers";

export class MediaManager{
    private userMediaSM = new UserMediaStreamManager();
    private virtualBGSM: VirtualBackgroundStreamManager;
    private screenShareSM = new TakingplaceScreenStreamManager();

    constructor(vbImagePath: string){
        this.virtualBGSM = new VirtualBackgroundStreamManager(vbImagePath);
    }

    getScreenShareSM(){
        return this.screenShareSM;
    }

    start(onUserStreamCreated: StreamCreatedListener,
        onUserStreamUpdated: StreamUpdatedListener,
        onScreenShareStopped: ()=>void
     ){
        this.virtualBGSM.attach(this.userMediaSM);
        this.screenShareSM.attach(this.virtualBGSM);
        this.screenShareSM.addEventListener("streamCreated", onUserStreamCreated);
        this.screenShareSM.addEventListener("streamUpdated", onUserStreamUpdated);
        this.screenShareSM.onScreenShareStopped = onScreenShareStopped;
        this.userMediaSM.acquire();
    }

    setMicEnabled(value: boolean){
        this.userMediaSM.setMicState(value);
    }
    setCameraEnabled(value: boolean){
        this.userMediaSM.setCameraState(value);
    }
    isScreenShareEnabled(){
        return this.screenShareSM.enabled;
    }
    setScreenShareEnabled(value: boolean){
        this.screenShareSM.setEnabled(value);
    }
}

/*
  mic　→
  camera → virtual background →　out
  screen share　→

 */