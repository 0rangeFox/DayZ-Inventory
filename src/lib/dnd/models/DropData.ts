interface DropData<TDrop = any, TDrag = any> {
    targetKey: string;
    dropData: TDrop;
    dragData: TDrag;
    dropElem: HTMLSpanElement;
}

export default DropData;
