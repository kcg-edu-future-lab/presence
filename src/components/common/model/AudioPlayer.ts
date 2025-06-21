import { Share, ShareClass } from "madoi-client";

@ShareClass({className: "AudioPlayer"})
export class AudioPlayer {
    private audio: HTMLAudioElement;

    constructor(src: string, volume: number){
        this.audio = new Audio(src);
        this.audio.volume = volume;
    }

    @Share({maxLog: 0})
    play(){
        this.audio.play();
    }
}
