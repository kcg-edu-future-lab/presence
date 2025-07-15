import { Madoi } from 'madoi-client';
import { ClickListener } from '../common/model/ClickableText';
import { TextButton } from './TextButton';
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
    madoi: Madoi;
    onTextClick?: ClickListener;
}
export function ReactionButtons({madoi, onTextClick}: Props){
    return <>
        <AudioTextButton madoi={madoi} src={se1} volume={0.7} onClick={onTextClick}>🍺</AudioTextButton>
        <AudioTextButton madoi={madoi} src={se2} volume={0.7} onClick={onTextClick}>👏</AudioTextButton>
        <AudioTextButton madoi={madoi} src={se3} volume={0.7} onClick={onTextClick}>👏😄</AudioTextButton>
        <AudioTextButton madoi={madoi} src={se4} volume={0.7} onClick={onTextClick}>🥁</AudioTextButton>
        <AudioTextButton madoi={madoi} src={se5} volume={0.7} onClick={onTextClick}>🎉</AudioTextButton>
        <AudioTextButton madoi={madoi} src={se6} volume={0.7} onClick={onTextClick}>🤪</AudioTextButton>
        <AudioTextButton madoi={madoi} src={se7} volume={0.7} onClick={onTextClick}>👍</AudioTextButton>
        <AudioTextButton madoi={madoi} src={se8} volume={0.7} onClick={onTextClick}>💰</AudioTextButton>
        <AudioTextButton madoi={madoi} src={se9} volume={0.7} onClick={onTextClick}>😨</AudioTextButton>
        <AudioTextButton madoi={madoi} src={se10} volume={0.7} onClick={onTextClick}>🔔</AudioTextButton>
        <AudioTextButton madoi={madoi} src={se11} volume={0.7} onClick={onTextClick}>🦵💦</AudioTextButton>
        <AudioTextButton madoi={madoi} src={se12} volume={0.7} onClick={onTextClick}>🙏</AudioTextButton>
        <AudioTextButton madoi={madoi} src={se13} volume={0.7} onClick={onTextClick}>ポク・ポク・ポク</AudioTextButton>
        <AudioTextButton madoi={madoi} src={se14} volume={0.7} onClick={onTextClick}>チーン</AudioTextButton>
        <br/>
        <TextButton madoi={madoi} onClick={onTextClick}>🙂</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>👏</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>😄</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>😁</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>😅</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>🤣</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>🫠</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>😇</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>😍</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>🤩</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>🤪</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>🤗</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>🤔</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>🤐</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>😴</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>🤢</TextButton>
        <TextButton madoi={madoi} onClick={onTextClick}>🤮</TextButton>
    </>;
}
