<script lang='ts'>
    import type { InventoryItem, Item } from '../../lib/models';
    import {getItemById, updateInventory} from '../../lib/stores/InventoryStore';
    import type { DragEvent, KeyboardDragEvent } from '../../lib/dnd/models';
    import {canSwapItemOnGrid, getIndexesById} from '../../lib/utils/InventoryUtil';
    import DropTarget from '../dnd/DropTarget.svelte';
    import DragDropContainer from '../dnd/DragDropContainer.svelte';

    export let inventoryId: number;
    export let blockId: number;
    export let grid: (string | null)[];
    export let gridWidth: number;

    export let size: number;
    export let slot: number;
    export let item: InventoryItem | null;

    let referenceItem: Item | null;
    let itemState: InventoryItem | null;

    let isDroppable: boolean = false;

    function onDragEnter({ detail: { data, dragElement } }: CustomEvent<DragEvent<InventoryItem>>): void {
        //console.log('Dragged in:', data?.id === item?.id, data, item)
        if (data?.id === item?.id && data?.rotated === item?.rotated) {
            dragElement.style.boxShadow = '0 0 0 1px transparent inset';
            isDroppable = false;
        } else if (data && canSwapItemOnGrid(grid, gridWidth, { ...data, slot }, item ? { ...item, slot: data.slot } : null)) {
            dragElement.style.boxShadow = '0 0 0 1px green inset';
            isDroppable = true;
        } else {
            dragElement.style.boxShadow = '0 0 0 1px yellow inset';
            isDroppable = false;
        }
    }

    function onDragLeave({ detail: { data, dragElement } }: CustomEvent<DragEvent<InventoryItem>>): void {
        //console.log('Dragged out:', data?.id === item?.id, data, item)
        if (data?.id === item?.id && data?.rotated === item?.rotated)
            dragElement.style.boxShadow = '0 0 0 1px transparent inset';
        else
            dragElement.style.boxShadow = '0 0 0 1px red inset';
    }

    function onDrop({ detail: { data } }: CustomEvent<DragEvent<InventoryItem>>): void {
        if (!isDroppable || !data) return;
        isDroppable = false;
        updateInventory({ ...data, slot }, item ? getIndexesById(item.id) : { inventory: inventoryId, block: blockId, slot: -1 });
    }

    function onRotateKey(e: CustomEvent<KeyboardDragEvent<KeyboardEvent>>): void {
        const { dragElement, keyboardEvent } = e.detail;

        if (referenceItem!.width === referenceItem!.height || keyboardEvent.code !== 'Space')
            return e.preventDefault();

        itemState!.rotated = !itemState!.rotated;

        const dragElementStyle: CSSStyleDeclaration = dragElement.style;
        const dragImageElementStyle: CSSStyleDeclaration = (dragElement.firstElementChild as HTMLDivElement).style;

        dragElementStyle.width = `${size * (itemState!.rotated ? referenceItem!.height : referenceItem!.width)}px`;
        dragElementStyle.height = `${size * (itemState!.rotated ? referenceItem!.width : referenceItem!.height)}px`;

        dragImageElementStyle.transform = `rotate(${itemState!.rotated ? -90 : 0}deg)`;
    }

    function onDragEnd(): void {
        itemState!.rotated = item!.rotated;
    }

    $: referenceItem = item ? getItemById(item.item) : null;
    $: itemState = item ? { ...item } : null;
</script>

<DropTarget
    on:dragEnter={onDragEnter}
    on:dragLeave={onDragLeave}
    on:drop={onDrop}
>
    <div
        class='slot'
        data-slot={slot}
    >
        {#if item}
            <DragDropContainer
                data={itemState}
                targetKey={referenceItem.type}
                on:key={onRotateKey}
                on:dragEnd={onDragEnd}
                hideCursor
            >
                <div
                    class='item'
                    style:width='{size * (item.rotated ? referenceItem.height : referenceItem.width)}px'
                    style:height='{size * (item.rotated ? referenceItem.width : referenceItem.height)}px'
                >
                    <div
                        class='img'
                        style:width={`${size * referenceItem.width}px`}
                        style:height={`${size * referenceItem.height}px`}
                        style:background-image='url("/images/inventory/items/{referenceItem.image}.png")'
                        style:transform='rotate({item.rotated ? -90 : 0}deg)'
                    />
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
        background-color: rgba(80, 80, 80, .6);

        display: flex;
        justify-content: center;
        align-items: center;

        .img {
            background-position: center;
            background-size: contain;
            background-repeat: no-repeat;
            background-origin: content-box;

            box-sizing: border-box;
            padding: 5%;
        }
    }
</style>