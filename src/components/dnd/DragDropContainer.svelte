<script lang='ts' context='module'>
    import { UNIQUE_KEY } from './DropTarget.svelte';

    function findDropElement(element: Element | null): HTMLSpanElement | null {
        let dropElement: HTMLSpanElement | null = element;

        while (dropElement && dropElement?.id !== UNIQUE_KEY)
            dropElement = dropElement?.parentElement;

        return dropElement;
    }

    function usesLeftButton(e: MouseEvent): boolean {
        return (e.button || e.buttons) === 1;
    }
</script>

<script lang='ts'>
    import { createEventDispatcher, onMount } from 'svelte';
    import type DragData from '../../lib/dnd/models/DragData';

    type TDrag = $$Generic<any>;

    export let data: TDrag | null = null;
    export let targetKey: any = null;

    const dispatch = createEventDispatcher();

    let containerElement: HTMLDivElement;
    let dropElement: HTMLSpanElement; // The drop element that belongs to this component.
    let dragElement: HTMLDivElement | null = null; // The DOM elem we're dragging, and the elements we're dragging over.
    let left: number = 0;
    let top: number = 0;

    let lastTarget: Element | null = null;

    onMount(() => {
        dropElement = findDropElement(containerElement) as HTMLSpanElement;
    });

    function updateTargetElementTo(x: number, y: number, forceUpdate: boolean = false): void {
        let targetElement: HTMLSpanElement | null = findDropElement(document.elementFromPoint(x, y));

        if (!forceUpdate && targetElement === lastTarget) return;

        if (forceUpdate || lastTarget !== dropElement)
            lastTarget?.dispatchEvent(new CustomEvent<DragData<TDrag>>('dragLeave', { detail: { targetKey, data, dragElement } }));
        (lastTarget = forceUpdate || targetElement !== dropElement ? targetElement : null)?.dispatchEvent(new CustomEvent<DragData<TDrag>>('dragEnter', { detail: { targetKey, data, dragElement } }));
    }

    function onKeyDown(e: KeyboardEvent) {
        if (!dragElement) return;

        if (dispatch('key', { event: e, dragElement }, { cancelable: true }))
            updateTargetElementTo(left, top, true);
    }

    function onMouseWheel(e: WheelEvent): void {
        if (!dragElement) return;

        updateTargetElementTo(left, top);
    }

    function onMouseMove(e: MouseEvent): void {
        if (!dragElement) return;

        dragElement.style.left = `${left += e.movementX}px`;
        dragElement.style.top = `${top += e.movementY}px`;

        if (dispatch('drag', { data: {} }, { cancelable: true }))
            updateTargetElementTo(left, top);
    }

    function onMouseUp(e: MouseEvent): void {
        if (!dragElement) return;

        if (lastTarget !== dropElement) {
            lastTarget?.dispatchEvent(new CustomEvent<DragData<TDrag>>('drop', { detail: { targetKey, data, dragElement } }));
            lastTarget = null;
        }

        dispatch('dragEnd', { data: {} });

        document.body.removeChild<HTMLDivElement>(dragElement);
        dragElement = null;
    }

    function onMouseDown(e: MouseEvent): void {
        if (!dragElement && usesLeftButton(e)) {
            dispatch('dragStart', { data: {} });

            const { width, height }: CSSStyleDeclaration = window.getComputedStyle(containerElement.firstElementChild);
            const { left: dLeft, top: dTop }: DOMRect = containerElement.getBoundingClientRect();
            left = dLeft;
            top = dTop;

            const newDragElement: HTMLDivElement = (containerElement.cloneNode(true) as HTMLDivElement).firstElementChild as HTMLDivElement;
            newDragElement.style.position = 'fixed';
            newDragElement.style.width = width;
            newDragElement.style.height = height;
            newDragElement.style.left = `${left}px`;
            newDragElement.style.top = `${top}px`;
            newDragElement.style.pointerEvents = 'none'; // To enable "scroll" actions.

            dragElement = document.body.appendChild<HTMLDivElement>(newDragElement);
        }
    }
</script>

<svelte:window
    on:keydown|preventDefault={onKeyDown}
    on:mousewheel={onMouseWheel}
    on:mousemove={onMouseMove}
    on:mouseup={onMouseUp}
/>

<div
    bind:this={containerElement}
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