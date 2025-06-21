import { useRef } from 'react';
import { ClickListener } from '../common/model/ClickableText';
import { Madoi } from 'madoi-client';
import { AudioButton } from './AudioButton';
import { TextButton } from './TextButton';
import { AudioTextButton } from './AudioTextButton';

interface Props{
    madoi: Madoi;
    onTextClick?: ClickListener;
}
export function ReactionButtons({madoi, onTextClick}: Props){
    const audioRef = useRef<HTMLAudioElement>(null);
    return <>
        <AudioTextButton madoi={madoi} src="media/nc103171.wav" volume={0.7}>🍺</AudioTextButton>
        <AudioTextButton madoi={madoi} src="media/nc120998.mp3" volume={0.2}>👏</AudioTextButton>
        <AudioButton madoi={madoi} src="media/8dc9afe8adb3406e80094ae474434b38.mp3" volume={0.7}>6LDK</AudioButton>
        <AudioButton madoi={madoi} src="media/drif.mp3" volume={0.2}>ドリフ</AudioButton>
        <TextButton madoi={madoi} onClick={onTextClick}>🙂</TextButton>
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

