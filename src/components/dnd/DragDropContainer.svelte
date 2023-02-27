<script lang='ts' context='module'>
    function usesLeftButton(e: MouseEvent): boolean {
        return (e.button || e.buttons) === 1;
    }
</script>

<script lang='ts'>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let dndContainerElement: HTMLDivElement; // Reference for this component.
    let dragElement: HTMLElement | null = null; // The DOM elem we're dragging, and the elements we're dragging over.
    let left: number = 0;
    let top: number = 0;

    let lastTarget: Element | null = null;

    function updateTargetElementTo(x: number, y: number): void {
        const parentDnDContainerElement: HTMLElement = dndContainerElement.parentElement;
        const targetElement: Element | null = document.elementFromPoint(x, y);

        if (targetElement === lastTarget) return;

        if (lastTarget !== parentDnDContainerElement)
            lastTarget?.dispatchEvent(new CustomEvent('dragLeave', { detail: (targetElement as HTMLElement | null)?.dataset }));
        (lastTarget = targetElement !== parentDnDContainerElement ? targetElement : null)?.dispatchEvent(new CustomEvent('dragEnter', { detail: (targetElement as HTMLElement | null)?.dataset }));
    }

    function onMouseDown(e: MouseEvent): void {
        if (!dragElement && usesLeftButton(e)) {
            dispatch('dragStart', { data: {} });

            const { width, height }: CSSStyleDeclaration = window.getComputedStyle(dndContainerElement.firstElementChild);
            const { left: dLeft, top: dTop }: DOMRect = dndContainerElement.getBoundingClientRect();
            left = dLeft;
            top = dTop;

            const newDragElement: HTMLElement = (dndContainerElement.cloneNode(true) as HTMLDivElement).firstElementChild as HTMLElement;
            newDragElement.style.position = 'fixed';
            newDragElement.style.width = width;
            newDragElement.style.height = height;
            newDragElement.style.left = `${left}px`;
            newDragElement.style.top = `${top}px`;
            newDragElement.style.pointerEvents = 'none'; // To enable "scroll" actions.

            dragElement = document.body.appendChild<HTMLElement>(newDragElement);
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
        const parentDnDContainerElement: HTMLElement = dndContainerElement.parentElement;

        if (lastTarget !== parentDnDContainerElement) {
            lastTarget?.dispatchEvent(new CustomEvent('drop', { detail: (lastTarget as HTMLElement | null)?.dataset }));
            lastTarget = null;
        }

        dispatch('dragEnd', { data: {} });

        document.body.removeChild<HTMLElement>(dragElement);
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
    style='display: {dragElement ? "none" : "inherit"};'
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

        :global(.item) {
            box-shadow: 0 0 0 1px transparent inset;
        }
    }
</style>