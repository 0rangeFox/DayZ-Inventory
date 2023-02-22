<script lang='ts'>
    import type { DragData, DropData, HitDragData, OnDragEnter, OnDragLeave, OnHitCallback } from '../../lib/dnd/models';
    import { Dispatch } from '../../lib/dnd/utils/EventUtil';

    type TDrop = $$Generic<any>;
    type TDrag = $$Generic<any>;

    export let highlightClassName: string = 'highlighted';
    export let targetKey: string | string[] = 'ddc';
    export let dropData: TDrop = {};
    export let onDragEnter: OnDragEnter = null;
    export let onDragLeave: OnDragLeave = null;
    export let onHit: OnHitCallback = null;

    let isHighlighted: boolean = false;
    let targetElement: HTMLSpanElement;

    // useCallback equivalent of React
    $: (handleDragEnter = (e: Event): void => {
        const event: CustomEvent<DragData<TDrag>> = e as CustomEvent<DragData<TDrag>>;

        if (highlightClassName)
            isHighlighted = true;

        props.onDragEnter?.(event);
    });

    $: (handleDragLeave = (e: Event): void => {
        const event: CustomEvent<DragData<TDrag>> = e as CustomEvent<DragData<TDrag>>;

        if (highlightClassName)
            isHighlighted = false;

        onDragLeave?.(event);
    });

    $: (handleDrop = (e: Event): void => {
        const event: CustomEvent<HitDragData<TDrag>> = e as CustomEvent<HitDragData<TDrag>>;

        Dispatch<DropData<TDrop, TDrag>>(
            event.detail.containerElem,
            targetKey,
            'Dropped',
            {
                targetKey: '',
                dropData,
                dragData: event.detail.dragData,
                dropElem: targetElement,
            }
        );

        onHit?.(event);
        isHighlighted = false;
    });

    const targetElemClassNames = `droptarget ${
        isHighlighted ? highlightClassName : ''
    }`;
</script>

<span
        bind:this={targetElement}
        class={targetElemClassNames}
>
    <slot />
</span>