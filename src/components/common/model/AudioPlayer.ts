import { ClassName, Distributed,  } from "madoi-client";

@ClassName("AudioPlayer")
export class AudioPlayer {
    private audio: HTMLAudioElement;

    constructor(){
        this.audio = new Audio();
    }

    @Distributed()
    play(src: string, volume: number) {
        this.audio.src = src;
        this.audio.volume = volume;
        this.audio.play();
    }
}
