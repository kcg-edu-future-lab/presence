import { ChangeState, ClassName, Distributed, GetState, SetState } from "madoi-client";
import { TagModel } from "./TagModel";

@ClassName("TagBoardModel")
export class TagBoardModel{
    get tags(){
        return this._tags;
    }

    @Distributed()
    @ChangeState()
    createTag(label: string, color: string){
        const tag: TagModel = {index: this.index++, label, position: [100, 100], color};
        this._tags.push(tag);
    }

    @Distributed()
    @ChangeState()
    moveTag(tagIndex: number, dx: number, dy: number){
        this._tags.filter(t=>t.index === tagIndex)
            .forEach(t=>{
                t.position[0] += dx;
                t.position[1] += dy;
            });
    }

    @Distributed()
    @ChangeState()
    changeTagLabel(tagIndex: number, label: string){
        this._tags.filter(t=>t.index === tagIndex)
            .forEach(t=>t.label = label);
    }

    @Distributed()
    @ChangeState()
    changeTagColor(tagIndex: number, color: string){
        this._tags.filter(t=>t.index === tagIndex)
            .forEach(t=>t.color = color);
    }

    @Distributed()
    @ChangeState()
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
