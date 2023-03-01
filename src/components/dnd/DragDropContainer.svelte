<script lang='ts' context='module'>
    function usesLeftButton(e: MouseEvent): boolean {
        return (e.button || e.buttons) === 1;
    }
</script>

<script lang='ts'>
    import { createEventDispatcher } from 'svelte';
    import { UNIQUE_KEY } from './DropTarget.svelte';
    import type DragData from '../../lib/dnd/models/DragData';

    type TDrag = $$Generic<any>;

    export let data: TDrag | null = null;
    export let targetKey: any = null;

    const dispatch = createEventDispatcher();

    let dndContainerElement: HTMLDivElement; // Reference for this component.
    let dragElement: HTMLDivElement | null = null; // The DOM elem we're dragging, and the elements we're dragging over.
    let left: number = 0;
    let top: number = 0;

    let lastTarget: Element | null = null;

    function updateTargetElementTo(x: number, y: number): void {
        const parentDnDContainerElement: HTMLDivElement = dndContainerElement.parentElement;
        let targetElement: Element | null = document.elementFromPoint(x, y);

        while (targetElement && targetElement?.id !== UNIQUE_KEY)
            targetElement = targetElement?.parentElement;

        if (targetElement === lastTarget) return;

        if (lastTarget !== parentDnDContainerElement)
            lastTarget?.dispatchEvent(new CustomEvent<DragData<TDrag>>('dragLeave', { detail: { targetKey, data, dragElement } }));
        (lastTarget = targetElement !== parentDnDContainerElement ? targetElement : null)?.dispatchEvent(new CustomEvent<DragData<TDrag>>('dragEnter', { detail: { targetKey, data, dragElement } }));
    }

    function onMouseDown(e: MouseEvent): void {
        if (!dragElement && usesLeftButton(e)) {
            dispatch('dragStart', { data: {} });

            const { width, height }: CSSStyleDeclaration = window.getComputedStyle(dndContainerElement.firstElementChild);
            const { left: dLeft, top: dTop }: DOMRect = dndContainerElement.getBoundingClientRect();
            left = dLeft;
            top = dTop;

            const newDragElement: HTMLDivElement = (dndContainerElement.cloneNode(true) as HTMLDivElement).firstElementChild as HTMLDivElement;
            newDragElement.style.position = 'fixed';
            newDragElement.style.width = width;
            newDragElement.style.height = height;
            newDragElement.style.left = `${left}px`;
            newDragElement.style.top = `${top}px`;
            newDragElement.style.pointerEvents = 'none'; // To enable "scroll" actions.

            dragElement = document.body.appendChild<HTMLDivElement>(newDragElement);
        }
    }

    function onMouseWheel(e: WheelEvent): void {
        if (!dragElement) return;

        updateTargetElementTo(left, top);
    }

    function onMouseMove(e: MouseEvent): void {
        if (!dragElement) return;

        dragElement.style.left = `${left += e.movementX}px`;
        dragElement.style.top = `${top += e.movementY}px`;

        updateTargetElementTo(left, top);

        dispatch('drag', { data: {} });
    }

    function onMouseUp(e: MouseEvent): void {
        if (!dragElement) return;
        const parentDnDContainerElement: HTMLDivElement = dndContainerElement.parentElement;

        if (lastTarget !== parentDnDContainerElement) {
            lastTarget?.dispatchEvent(new CustomEvent<DragData<TDrag>>('drop', { detail: { targetKey, data, dragElement } }));
            lastTarget = null;
        }

        dispatch('dragEnd', { data: {} });

        document.body.removeChild<HTMLDivElement>(dragElement);
        dragElement = null;
    }
</script>

<svelte:window
    on:mousewheel={onMouseWheel}
    on:mousemove={onMouseMove}
    on:mouseup={onMouseUp}
/>

<div
    bind:this={dndContainerElement}
    on:mousedown={onMouseDown}
    class='container'
    style:display={dragElement ? 'none' : 'inherit'}
>
    <slot />
</div>

<style lang='scss'>
    .container {
        position: relative;
        width: inherit;
        height: inherit;

        user-select: none;
        cursor: default;
    }
</style>