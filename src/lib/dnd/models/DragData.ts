interface DragData<T = any> {
    targetKey: any | any[];
    data?: T;
    dragElement: HTMLDivElement;
}

export default DragData;
