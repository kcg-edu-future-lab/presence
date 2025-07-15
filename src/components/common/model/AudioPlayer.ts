import { Notify, ShareClass } from "madoi-client";

@ShareClass({className: "AudioPlayer"})
export class AudioPlayer {
    private audio: HTMLAudioElement;

    constructor(src: string, volume: number){
        this.audio = new Audio(src);
        this.audio.volume = volume;
    }

    @Notify()
    play(){
        this.audio.play();
    }
}
