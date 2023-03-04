interface DragEvent<T = any> {
    targetKey: any | any[];
    data?: T;
    dragElement: HTMLElement;
}

export default DragEvent;
