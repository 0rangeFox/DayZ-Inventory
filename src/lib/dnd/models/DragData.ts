interface DragData<T = any> {
    targetKey: string;
    dragData: T;
    dragElem: HTMLDivElement;
    containerElem: HTMLDivElement;
    sourceElem: HTMLSpanElement;
}

export default DragData;
