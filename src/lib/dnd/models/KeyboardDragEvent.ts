import type { DragEvent } from '.';

interface KeyboardDragEvent<T = any> extends DragEvent<T>{
    keyboardEvent: KeyboardEvent;
}

export default KeyboardDragEvent;
