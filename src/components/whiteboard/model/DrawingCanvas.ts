import { GetState, SetState, Share, ShareClass } from "madoi-client";

interface Line{
    type: "line";
    sx: number; sy: number;
    tx: number; ty: number;
    size: number; color: string;
}
interface Clear{
    type: "clear";
}
type Drawing = Line | Clear;

@ShareClass({className: "DrawingCanvas"})
export class DrawingCanvas{
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null = null;
    private colorInput: HTMLInputElement | null = null;
    private sizeInput: HTMLInputElement | null = null;
    private drawing: boolean = false;
    private button: number = 0;
    private prevPos = { x: 0, y: 0 };
    private loading: boolean = false;
    private pendingDrawings = new Array<Drawing>();

    private canvasMouseDown(e: MouseEvent){
        if(this.ctx === null) return;
        this.drawing = true;
        this.button = e.button;
        this.prevPos.x = e.offsetX;
        this.prevPos.y = e.offsetY;
        this.ctx.lineCap = 'round';
        e.preventDefault();
    }

    private canvasMouseUp(e: MouseEvent){
        this.drawing = false;
        e.preventDefault();
    }

    private canvasMouseMove(e: MouseEvent){
        if (!this.drawing || this.ctx === null || this.sizeInput === null || this.colorInput === null) return;
        let c = "#FFFFFF";
        let size = parseInt(this.sizeInput.value);
        if (this.button === 0) {
            c = this.colorInput.value;
        } else{
            size += 4;
        }
        this.draw(this.prevPos.x, this.prevPos.y, e.offsetX, e.offsetY, size, c);
        this.prevPos = {x: e.offsetX, y: e.offsetY};
    }

    private newCanvas(width: number, height: number): HTMLCanvasElement{
        const c = document.createElement("canvas");
        c.width = width;
        c.height = height;
        c.style.display = "none";
        document.body.appendChild(c);
        return c;
    }

    constructor(width: number = 640, height: number = 480){
        this.canvas = this.newCanvas(width, height);
        this.ctx = this.canvas.getContext("2d");
        if(this.ctx === null) return;
        this.ctx.fillStyle = "rgb(255, 255, 255)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.font = "60px 'ＭＳ Ｐゴシック'";
        this.ctx.fillText("ボード", 10, 70);
    }

    private canvasMouseDownListener = (e: MouseEvent)=>this.canvasMouseDown(e);
    private canvasMouseUpListener = (e: MouseEvent)=>this.canvasMouseUp(e);
    private canvasMouseMoveListener = (e: MouseEvent)=>this.canvasMouseMove(e);
    attach(canvas: HTMLCanvasElement, sizeInput: HTMLInputElement, colorInput: HTMLInputElement) : ()=>void{
        this.ctx = canvas.getContext("2d");
        this.ctx?.drawImage(this.canvas, 0, 0);
        this.canvas.remove();
        this.canvas = canvas;

        this.canvas.addEventListener("mousedown", this.canvasMouseDownListener);
        this.canvas.addEventListener("mousemove", this.canvasMouseMoveListener);
        this.canvas.addEventListener("mouseup", this.canvasMouseUpListener);
        this.canvas.oncontextmenu = () => false;
        this.sizeInput = sizeInput;
        this.colorInput = colorInput;

        return ()=>{
            this.detach();
        }
    }

    detach(){
        this.sizeInput = null;
        this.colorInput = null;
        this.canvas.removeEventListener("mousedown", this.canvasMouseDownListener);
        this.canvas.removeEventListener("mousemove", this.canvasMouseMoveListener);
        this.canvas.removeEventListener("mouseup", this.canvasMouseUpListener);

        const c = this.newCanvas(this.canvas.width, this.canvas.height);
        this.ctx = c.getContext("2d");
        this.ctx?.drawImage(this.canvas, 0, 0);
        this.canvas = c;
    }

    @Share()
    draw(prevX: number, prevY: number, x: number, y: number, size: number, color: string) {
        this.pendingDrawings.push({
            type: "line",
            sx: prevX, sy: prevY,
            tx: x, ty: y,
            size, color
        });
        this.processPendingDrawings();
    }

    @Share()
    clear(){
        this.pendingDrawings.push({type: "clear"});
        this.processPendingDrawings();
    }
  
    @GetState({maxInterval: 10000, maxUpdates: 100})
    getState(): string {
        return this.canvas?.toDataURL("image/png") || "";
    }
  
    @SetState()
    setState(state: string) {
        this.loading = true;
        const img = new Image();
        img.onload = () => {
            if(this.ctx === null) return;
            this.ctx.drawImage(img, 0, 0);
            this.processPendingDrawings();
            this.loading = false;
        };
        img.src = state;
    }

    async getAsArrayBuffer(): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            this.canvas.toBlob(blob=>{
                if(blob === null) return;
                const reader = new FileReader();
                reader.readAsArrayBuffer(blob);
                reader.onload = ()=>{
                    resolve(reader.result as ArrayBuffer);
                };
            });
        });
    }

    private processPendingDrawings(){
        if(this.loading || this.ctx === null) return;
        const ctx = this.ctx;
        for(const p of this.pendingDrawings){
            if(p.type === "line"){
                ctx.beginPath();
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.size;
                ctx.moveTo(p.sx, p.sy);
                ctx.lineTo(p.tx, p.ty);
                ctx.stroke();
            } else if(p.type === "clear"){
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
        this.pendingDrawings = new Array();
    }
}
