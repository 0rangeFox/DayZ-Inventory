<script lang='ts'>
    import type { DragData, HitDragData } from '../../lib/dnd/models';

    type TDrop = $$Generic<any>;
    type TDrag = $$Generic<any>;

    export let id: number;

    // useCallback equivalent of React
    $: (dragEnter = (e: CustomEvent<DragData<TDrag>>): void => {
        console.log(`DropTarget | ${id} | DragEnter`, e.detail);
    });

    $: (dragLeave = (e: CustomEvent<DragData<TDrag>>): void => {
        console.log(`DropTarget | ${id} | DragLeave`);
    });

    $: (drop = (e: CustomEvent<HitDragData<TDrag>>): void => {
        console.log(`DropTarget | ${id} | Drop`);
    });
</script>

<slot {dragEnter} {dragLeave} {drop} />