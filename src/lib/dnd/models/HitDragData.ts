import type { DragData } from './index';

type HitDragData<T = any> = DragData<T> & {
    x: number;
    y: number;
};

export default HitDragData;
