import './TagBoard.css';
import { TagBoardModel } from "./model/TagBoardModel";
import { TagModel } from './model/TagModel';
import { Tag } from './Tag';

interface Props{
    tagBoardModel: TagBoardModel;
}
export function TagBoard({tagBoardModel}: Props){
    const onButtonClick = ()=>{
        tagBoardModel.createTag("New Tag", "#ffff00");
    };
    const onTagMove = (tag: TagModel, dx: number, dy: number)=>{
        tagBoardModel.moveTag(tag.index, dx, dy);
    };
    const onTagTextChange = (tag: TagModel, text: string)=>{
        tagBoardModel.changeTagLabel(tag.index, text);
    };
    const onTagColorChange = (tag: TagModel, color: string)=>{
        tagBoardModel.changeTagColor(tag.index, color);
    };
    const onTagRemove = (tag: TagModel)=>{
        tagBoardModel.removeTag(tag.index);
    };
    return <div id="tagBoard">
        <div id="controller">
            <input type="button" id="add-button" value="追加" onClick={onButtonClick}/>
        </div>
        <div id="sticky-note-container" style={{position: "relative"}}>
            {tagBoardModel.tags.map((t, i)=><Tag key={i} tag={t}
                onMove={onTagMove} onTextChange={onTagTextChange}
                onColorChange={onTagColorChange} onRemove={onTagRemove} />)}
        </div>
    </div>;
}
