import { Notify, ShareClass } from "madoi-client";

@ShareClass({className: "AudioPlayer"})
export class AudioPlayer {
    private audio: HTMLAudioElement;

    constructor(){
        this.audio = new Audio();
    }

    @Notify()
    play(src: string, volume: number) {
        this.audio.src = src;
        this.audio.volume = volume;
        this.audio.play();
    }
}
