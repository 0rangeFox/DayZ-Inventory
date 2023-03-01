<script lang='ts'>
    import DragDropContainer from '../dnd/DragDropContainer.svelte';
    import DropTarget from '../dnd/DropTarget.svelte';
    import type { InventoryItem, Item } from '../../lib/models';
    import { getItemById } from '../../lib/stores/InventoryStore';
    import type {DragData} from "../../lib/dnd/models";

    export let slot: number;
    export let item: InventoryItem | null;
    const referenceItem: Item | null = item ? getItemById(item.item) : null;

    function onDragEnter(e: CustomEvent<DragData<InventoryItem>>) {
        e.detail.dragElement.style.boxShadow = '0 0 0 1px green inset';
    }

    function onDragLeave(e: CustomEvent<DragData<InventoryItem>>) {
        e.detail.dragElement.style.boxShadow = '0 0 0 1px red inset';
    }

    function onDrag(e) {
        //console.log('Test', e)
    }
</script>

<DropTarget
    on:dragEnter={onDragEnter}
    on:dragLeave={onDragLeave}
>
    <div
        class='slot'
        data-slot={slot}
    >
        {#if item}
            <DragDropContainer
                data={item}
                targetKey={referenceItem.type}
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