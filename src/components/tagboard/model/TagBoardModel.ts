import { GetState, SetState, Share, ShareClass } from "madoi-client";
import { TagModel } from "./TagModel";

@ShareClass({className: "TagBoardModel"})
export class TagBoardModel{
    get tags(){
        return this._tags;
    }

    @Share()
    createTag(label: string, color: string){
        const tag: TagModel = {index: this.index++, label, position: [100, 100], color};
        this._tags.push(tag);
    }

    @Share()
    moveTag(tagIndex: number, dx: number, dy: number){
        this._tags.filter(t=>t.index === tagIndex)
            .forEach(t=>{
                t.position[0] += dx;
                t.position[1] += dy;
            });
    }

    @Share()
    changeTagLabel(tagIndex: number, label: string){
        this._tags.filter(t=>t.index === tagIndex)
            .forEach(t=>t.label = label);
    }

    @Share()
    changeTagColor(tagIndex: number, color: string){
        this._tags.filter(t=>t.index === tagIndex)
            .forEach(t=>t.color = color);
    }

    @Share()
    removeTag(tagIndex: number){
        this._tags = this._tags.filter((t)=>t.index !== tagIndex);
    }

    @GetState()
    getState(){
        return {
            index: this.index,
            tags: this.tags
        }
    }

    @SetState()
    setState(state: {index: number, tags: TagModel[]}){
        this.index = state.index;
        this._tags = state.tags;
    }

    private index = 0;
    private _tags: TagModel[] = [];
}
