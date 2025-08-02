import { AudioPlayer } from '../common/model/AudioPlayer';
import { TextButton } from './TextButton';
import { AudioButton } from './AudioButton';
import { AudioTextButton } from './AudioTextButton';
import "./ReactionButtons.css";
import se1 from "/src/assets/グラスを合わせる.mp3";
import se2 from "/src/assets/スタジアムの拍手.mp3";
import se3 from "/src/assets/歓声と拍手1.mp3";
import se4 from "/src/assets/ドラムロール.mp3";
import se5 from "/src/assets/ジャジャーン.mp3";
import se6 from "/src/assets/ちゃんちゃん♪3.mp3";
import se7 from "/src/assets/ドンドンパフパフ.mp3";
import se8 from "/src/assets/金額表示.mp3";
import se9 from "/src/assets/バイオリン恐怖音1.mp3";
import se10 from "/src/assets/教会の鐘2.mp3";
import se11 from "/src/assets/足首がグキッ.mp3";
import se12 from "/src/assets/お寺の鐘.mp3";
import se13 from "/src/assets/木魚ポク・ポク・ポク.mp3";
import se14 from "/src/assets/チーン1.mp3";

interface Props{
    audioPlayer: AudioPlayer;
    onTextClick?: (text: string)=> void;
}
export function ReactionButtons({audioPlayer, onTextClick}: Props){
    const onAudioTextClick = (src: string, volume: number, text?: string)=>{
        audioPlayer.play(src, volume);
        if(onTextClick && text) onTextClick(text);
    };
    const onAudioClick = (src: string, volume: number)=>{
        audioPlayer.play(src, volume);
    };
    return <>
        <span><small>効果音あり</small></span><br/>
        <AudioTextButton src={se1} volume={0.7} onClick={onAudioTextClick}>🍺</AudioTextButton>
        <AudioTextButton src={se2} volume={0.7} onClick={onAudioTextClick}>👏</AudioTextButton>
        <AudioTextButton src={se3} volume={0.7} onClick={onAudioTextClick}>👏😄</AudioTextButton>
        <AudioTextButton src={se4} volume={0.7} onClick={onAudioTextClick}>🥁</AudioTextButton>
        <AudioTextButton src={se5} volume={0.7} onClick={onAudioTextClick}>🎉</AudioTextButton>
        <AudioTextButton src={se6} volume={0.7} onClick={onAudioTextClick}>🤪</AudioTextButton>
        <AudioTextButton src={se7} volume={0.7} onClick={onAudioTextClick}>👍</AudioTextButton>
        <AudioTextButton src={se8} volume={0.7} onClick={onAudioTextClick}>💰</AudioTextButton>
        <AudioTextButton src={se9} volume={0.7} onClick={onAudioTextClick}>😨</AudioTextButton>
        <AudioTextButton src={se10} volume={0.7} onClick={onAudioTextClick}>🔔</AudioTextButton>
        <AudioTextButton src={se11} volume={0.7} onClick={onAudioTextClick}>🦵💦</AudioTextButton>
        <AudioTextButton src={se12} volume={0.7} onClick={onAudioTextClick}>🙏</AudioTextButton>
        <AudioTextButton src={se13} volume={0.7} onClick={onAudioTextClick}>ポク・ポク・ポク</AudioTextButton>
        <AudioTextButton src={se14} volume={0.7} onClick={onAudioTextClick}>チーン</AudioTextButton>
        <AudioButton src="media/8dc9afe8adb3406e80094ae474434b38.mp3" volume={0.7} onClick={onAudioClick}>6LDK</AudioButton>
        <AudioButton src="media/drif.mp3" volume={0.2} onClick={onAudioClick}>ドリフ</AudioButton>
        <br/>
        <span><small>効果音なし</small></span><br/>
        <TextButton onClick={onTextClick}>🙂</TextButton>
        <TextButton onClick={onTextClick}>😄</TextButton>
        <TextButton onClick={onTextClick}>😁</TextButton>
        <TextButton onClick={onTextClick}>😅</TextButton>
        <TextButton onClick={onTextClick}>🤣</TextButton>
        <TextButton onClick={onTextClick}>🫠</TextButton>
        <TextButton onClick={onTextClick}>😇</TextButton>
        <TextButton onClick={onTextClick}>😍</TextButton>
        <TextButton onClick={onTextClick}>🤩</TextButton>
        <TextButton onClick={onTextClick}>🤪</TextButton>
        <TextButton onClick={onTextClick}>🤗</TextButton>
        <TextButton onClick={onTextClick}>🤔</TextButton>
        <TextButton onClick={onTextClick}>🤐</TextButton>
        <TextButton onClick={onTextClick}>😴</TextButton>
        <TextButton onClick={onTextClick}>🤢</TextButton>
        <TextButton onClick={onTextClick}>🤮</TextButton>
    </>;
}
