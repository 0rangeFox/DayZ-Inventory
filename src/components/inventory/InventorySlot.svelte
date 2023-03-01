<script lang='ts'>
    import DragDropContainer from '../dnd/DragDropContainer.svelte';
    import DropTarget from '../dnd/DropTarget.svelte';
    import type { InventoryItem, Item } from '../../lib/models';
    import { getItemById } from '../../lib/stores/InventoryStore';

    export let id: string | undefined;
    export let item: InventoryItem | undefined;
    const referenceItem: Item | undefined = item ? getItemById(item.item) : undefined;

    function onDragEnter() {

    }

    function onDrag(e) {
        //console.log('Test', e)
    }
</script>

<DropTarget {id} let:dragEnter let:dragLeave let:drop>
    <div
        on:dragEnter={dragEnter}
        on:dragLeave={dragLeave}
        on:drop={drop}
        class='slot'
        data-slot={id}
    >
        {#if item}
            <DragDropContainer
                on:drag={onDrag}
            >
                <div
                    class='item'
                    style='--width: {referenceItem.width}; --height: {referenceItem.height};'
                >
                    <div class='img' style='--img: url("/images/inventory/items/{referenceItem.image}.png");'></div>
                </div>
            </DragDropContainer>
        {/if}
    </div>
</DropTarget>

<style lang='scss'>
    .slot {
        width: 100%;
        height: 100%;
    }

    .item {
        width: calc(100% * var(--width));
        height: calc(100% * var(--height));

        background-color: rgba(80, 80, 80, 0.6);

        .img {
            height: 100%;

            box-sizing: border-box;

            background-image: var(--img);
            background-position: center;
            background-size: contain;
            background-repeat: no-repeat;
            background-origin: content-box;

            padding: 5%;
        }
    }
</style>