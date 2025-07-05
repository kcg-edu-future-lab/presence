import { TypedEventListenerOrEventListenerObject, TypedEventTarget } from "madoi-client";

export interface ASRResult{
  results: string[];
}
export type ASRResultListener = TypedEventListenerOrEventListenerObject<ASREngine, ASRResult>;
export interface ASRFinished{
}
export type ASRFinishedListener = TypedEventListenerOrEventListenerObject<ASREngine, ASRFinished>;
export class ASREngine extends TypedEventTarget<ASREngine, {
  results: ASRResult,
  finished: ASRFinished
}>{
  private recognition: SpeechRecognition ;
  private recognizing = false;
  private errorCode: SpeechRecognitionErrorCode | null = null;
  private lastSize = 0;

  private startTime = 0;

  constructor(private keepEnabled = false, private language = "ja-JP"){
    super();
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const rec = new SpeechRecognition();
    this.recognition = rec;
    this.lastSize = 0;
    rec.lang = language;
    rec.continuous = true;
    rec.onresult = e => {
      const results: string[] = [];
      for(let i = this.lastSize; i < e.results.length; i++){
        if(!e.results[i].isFinal) break;
        results.push(e.results[i][0].transcript);
      }
      this.lastSize += results.length;
      if(results.length > 0)
        this.dispatchCustomEvent("results", {results});
    };
    rec.onstart = () => {
      console.info(`音声認識(${this.language})を開始しました.`);
      this.errorCode = null;
    };
    rec.onerror = (e: SpeechRecognitionErrorEvent) =>{
      console.info(`音声認識でエラーが発生しました: ${e.error}`);
      this.errorCode = e.error;
    };
    rec.onend = (e: Event) => {
      if(this.recognizing && this.keepEnabled &&
          (this.errorCode === null ||
            ["abort", "network", "no-speech"].includes(this.errorCode)) &&
          this.startTime > 0){
        const rest = 60 * 60 * 1000 - (new Date().getTime() - this.startTime);
        if(rest > 0){
          console.log(`音声認識を再起動します(残り${Math.floor(rest / 1000)}秒).`);
          this.recognition?.start();
          this.lastSize = 0;
        }
      } else{
        console.log("音声認識が終了しました.")
        this.recognizing = false;
        this.dispatchCustomEvent("finished");
      }
    };
  }

  isRecognizing(){
    return this.recognizing;
  }

  getLanguage(){
    return this.language;
  }

  setLanguage(language: string){
    this.language = language;
  }

  isKeepEnabled(){
    return this.keepEnabled;
  }

  setKeepEnabled(value: boolean){
    this.keepEnabled = value;
  }

  start(){
    if(this.recognizing) return;
    this.recognition?.start();
    this.recognizing = true;
    this.startTime = new Date().getTime();
  }

  stop(){
    if(!this.recognizing) return;
    this.recognition?.stop();
    this.recognizing = false;
  }
}
