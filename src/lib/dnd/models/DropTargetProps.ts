import type { DragData, HitDragData } from './index';

type OnDragEnter = <TDrag>(event: CustomEvent<DragData<TDrag>>) => void;
type OnDragLeave = OnDragEnter;
type OnHitCallback = <TDrag>(event: CustomEvent<HitDragData<TDrag>>) => void;

type DropTargetProps<TDrop, TDrag> = {
    highlightClassName?: string;

    // Needs to match the targetKey in the DragDropContainer -- matched via the enter/leave/drop event names, above
    targetKey?: string | string[];

    // Data that gets sent back to the DragDropContainer and shows up in its onDrop() callback event
    dropData?: TDrop;

    // Callbacks
    onDragEnter?: OnDragEnter;
    onDragLeave?: OnDragLeave;
    onHit?: OnHitCallback;
};

export default DropTargetProps;
export type {
    OnDragEnter,
    OnDragLeave,
    OnHitCallback
};
