<script lang='ts' context='module'>
    function usesLeftButton(e: MouseEvent): boolean {
        return (e.button || e.buttons) === 1;
    }

    function getOffscreenCoordinates(x: number, y: number): [number, number] | undefined {
        // are we offscreen (or very close, anyway)? if so by how much?
        const leftEdge: number = 10;
        const rightEdge: number = window.innerWidth - 10;
        const topEdge: number = 10;
        const bottomEdge: number = window.innerHeight - 10;
        const xOff: number = x < leftEdge ? x - leftEdge : x > rightEdge ? x - rightEdge : 0;
        const yOff: number = y < topEdge ? y - topEdge : y > bottomEdge ? y - bottomEdge : 0;
        return yOff || xOff ? [xOff, yOff] : undefined;
    }

    interface DragDropContainerState {
        clicked: boolean;
        isDragging: boolean;
        leftOffset: number;
        topOffset: number;
        left: number;
        top: number;
    }

    enum DisplayMode {
        DISAPPEARED,
        HIDDEN,
        NORMAL,
    }
</script>

<script lang='ts'>
    import {onDestroy, onMount, SvelteComponent} from 'svelte';
    import {AddListener, Dispatch, RemoveListener} from "../../lib/dnd/utils/EventUtil";
    import type {DragData, DropData, HitDragData} from "../../lib/dnd/models";

    type TDrop = $$Generic<any>;
    type TDrag = $$Generic<any>;

    // Determines what you can drop on
    export let targetKey: string | string[] = 'ddc';

    // If provided, we'll drag this instead of the actual object. Takes priority over dragClone if both are set
    export let customDragElement: SvelteComponent | null = null;

    // Makes the dragged element completely disappear while dragging so that it takes up no space
    export let disappearDraggedElement: boolean = false;

    // If true, then we will drag a clone of the object instead of the object itself. See also customDragElement
    export let dragClone: boolean = false;

    // Ghost element will display with this opacity
    export let dragElemOpacity: number = 1;

    // We will pass this data to the target when you drag or drop over it
    export let dragData: TDrag = {};

    // If included, we'll only let you drag by grabbing elements with this className
    export let dragHandleClassName: string = '';

    // If true, then dragging is turned off
    export let noDragging: boolean = false;

    // Callbacks (optional):
    export let onDragStart: (data: TDrag) => void | null = null;
    export let onDrag: (data: TDrag, target: Element, x: number, y: number, forceUpdate: VoidFunction) => void | null = null;
    export let onDragEnd: (data: TDrag, target: Element, x: number, y: number) => void | null = null;
    export let onDrop: (event: CustomEvent<DropData<TDrop, TDrag>>) => void | null = null;

    // Constrain dragging to the x or y directions only
    export let xOnly: boolean = false;
    export let yOnly: boolean = false;

    // Defaults to 10 while dragging, but you can customize it
    export let zIndex: number = 10;

    let containerElement: HTMLDivElement;
    let dragElement: HTMLDivElement; // The DOM elem we're dragging, and the elements we're dragging over.
    let sourceElement: HTMLSpanElement;

    let currentTarget: Element;
    let previousTarget: Element;
    let previousData: TDrag;

    let state: DragDropContainerState = {
        clicked: false,
        isDragging: false,
        leftOffset: 0,
        topOffset: 0,
        left: 0,
        top: 0
    };

    function handleDrop(e: Event): void {
        onDrop?.(e as CustomEvent<DropData<TDrop, TDrag>>);
    }

    function generateDragData(): DragData<TDrag> {
        return {
            targetKey: '',
            dragData,
            dragElem: dragElement,
            containerElem: containerElement,
            sourceElem: sourceElement,
        } satisfies DragData<TDrag>;
    }

    // Drop the z-index to get this elem out of the way, figure out what we're dragging over, then reset z-index
    function setCurrentTarget(x: number, y: number): void {
        dragElement.style.zIndex = String(-1);
        const target = document.elementFromPoint(x, y) || document.body;
        dragElement.style.zIndex = String(zIndex);
        // Prevent it from selecting itself as the target
        currentTarget = dragElement.contains(target) ? document.body : target;
    }

    // Generate events as we enter and leave elements while dragging
    function generateEnterLeaveEvents(x: number, y: number): void {
        setCurrentTarget(x, y);

        if (currentTarget !== previousTarget || dragData !== previousData) {
            if (previousTarget)
                Dispatch<DragData<TDrag>>(
                    previousTarget,
                    targetKey,
                    'DragLeave',
                    generateDragData()
                );

            if (currentTarget)
                Dispatch<DragData<TDrag>>(
                    currentTarget,
                    targetKey,
                    'DragEnter',
                    generateDragData()
                );
        }

        previousData = dragData;
        previousTarget = currentTarget;
    }

    function generateDropEvent(x: number, y: number): void {
        // Generate a drop event in whatever we're currently dragging over
        setCurrentTarget(x, y);

        Dispatch<HitDragData<TDrag>>(currentTarget, targetKey, 'Drop', {
            ...generateDragData(),
            x,
            y,
        });

        // To prevent multiplying events on drop
        RemoveListener(
            document.documentElement,
            targetKey,
            'Dropped',
            handleDrop
        );
    }

    function handleMouseDown(e: MouseEvent): void {
        if (usesLeftButton(e) && !noDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            startDrag(e.clientX, e.clientY);
        }
    }

    function startDrag(clickX: number, clickY: number): void {
        AddListener(
            document.documentElement,
            targetKey,
            'Dropped',
            handleDrop
        );

        state = {
            ...state,
            clicked: true,
            leftOffset: 0,
            topOffset: 0,
            left: clickX,
            top: clickY
        };
        onDragStart?.(dragData);
    }

    function handleMouseMove(e: MouseEvent): void {
        if (!noDragging && state.clicked) {
            e.preventDefault();
            drag(e.clientX, e.clientY);
        }
    }

    function drag(x: number, y: number): void {
        generateEnterLeaveEvents(x, y);

        const stateChanges: any = { isDragging: true };
        const offScreen: boolean = !!getOffscreenCoordinates(x, y);

        if (!offScreen) {
            if (!yOnly) stateChanges.left = state.leftOffset + x;
            if (!xOnly) stateChanges.top = state.topOffset + y - 55;
        }

        state = {
            ...state,
            ...stateChanges
        };
        onDrag?.(dragData, currentTarget, x, y, () => drag(x, y))
    }

    function handleMouseUp(e: MouseEvent): void {
        state = {
            ...state,
            clicked: false
        }
        state.isDragging && drop(e.clientX, e.clientY)
    }

    function drop(x: number, y: number): void {
        generateDropEvent(x, y);

        removeListeners();

        state = {
            ...state,
            isDragging: false
        }
        onDragEnd?.(dragData, currentTarget!, x, y);
    }

    function getDisplayMode(): DisplayMode {
        if (state.isDragging && !dragClone && !customDragElement)
            return disappearDraggedElement ? DisplayMode.DISAPPEARED : DisplayMode.HIDDEN;
        return DisplayMode.NORMAL;
    }

    function removeListeners(): void {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        RemoveListener(
            document.documentElement,
            targetKey,
            'Dropped',
            handleDrop
        );
    }

    onDestroy(removeListeners);

    $: displayMode = getDisplayMode();
    $: containerStyles = `
        position: ${displayMode === DisplayMode.DISAPPEARED ? 'absolute' : 'relative'};
    `;
    $: sourceElemStyles = `
        display: ${displayMode === DisplayMode.DISAPPEARED ? 'none' : 'inherit'};
        visibility: ${displayMode === DisplayMode.HIDDEN ? 'hidden' : 'inherit'};
    `;
    $: ghostStyles = `
        position: fixed;
        z-index: ${zIndex};
        top: ${state.top}px;
        left: ${state.left}px;
        opacity: ${dragElemOpacity};
        display: ${state.isDragging ? 'block' : 'none'};
    `;
</script>

<div
    bind:this={containerElement}
    on:mousedown={handleMouseDown}
    style={containerStyles}
>
    <span
        bind:this={sourceElement}
        style={sourceElemStyles}
    >
      <slot />
    </span>
    <div
        bind:this={dragElement}
        style={ghostStyles}
    >
        <slot name='drag'>
            <slot />
        </slot>
    </div>
</div>