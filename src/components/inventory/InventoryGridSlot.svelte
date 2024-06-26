<script lang='ts'>
    import { beforeUpdate } from 'svelte';
    import type { InventoryItem, InventoryGridSlotProps, Item, InventoryItemIndexes, InventoryDragData } from '../../lib/models';
    import { deserialize } from '../../lib/utils/JsonUtil';
    import { InventoryGridSlotPropsSchema, isInventoryItemDragData } from '../../lib/models';
    import { canSwapItem, canSwapSlot, getInventoryItemByIndexes } from '../../lib/utils/InventoryUtil';
    import { getItemById, updateInventory } from '../../lib/stores/InventoryStore';
    import type { DragEvent, KeyboardDragEvent } from '../../lib/dnd/models';
    import { deepEqual } from 'fast-equals';
    import DropTarget from '../dnd/DropTarget.svelte';
    import DragDropContainer from '../dnd/DragDropContainer.svelte';

    export let size: number;
    export let data: string;

    let slot: number;
    let index: Readonly<InventoryItemIndexes>;
    let item: Readonly<InventoryItem> | null;
    let referenceItem: Readonly<Item> | null;

    let isDragging: boolean = false;
    let dragState: InventoryDragData;
    let isDroppable: boolean = false;

    beforeUpdate(() => {
        if (isDragging) return;

        const props: Readonly<InventoryGridSlotProps> = deserialize(InventoryGridSlotPropsSchema)(data);
        slot = props.slot;
        index = props.index;
        item = getInventoryItemByIndexes(index);
        referenceItem = item ? getItemById(item.item) : null;
        dragState = { index, rotated: item?.rotated ?? false };

        console.log('Item ID:', item?.id, index);
    });

    function onDragEnter({ detail: { data, dragElement } }: CustomEvent<DragEvent<InventoryDragData>>): void {
        if (!data) {
            dragElement.style.boxShadow = 'inset 0 0 0 1px red';
            isDroppable = false;
        } else

        // Check if is same item when dragging to original "released landing spot"
        if (isInventoryItemDragData(data.index) && deepEqual(index, data.index) && data.rotated === item?.rotated) {
            dragElement.style.boxShadow = 'inset 0 0 0 1px transparent';
            isDroppable = false;
        } else if (
            isInventoryItemDragData(data.index) && canSwapItem(data.index, index, slot, data.rotated) // If swapping between the items
            || canSwapSlot(data.index, index, null, slot, data.rotated) // If swapping from slot to item or vice-versa
        ) {
            dragElement.style.boxShadow = 'inset 0 0 0 1px green';
            isDroppable = true;
        } else {
            dragElement.style.boxShadow = 'inset 0 0 0 1px red';
            isDroppable = false;
        }
    }

    function onDragLeave({ detail: { dragElement } }: CustomEvent<DragEvent<InventoryDragData>>): void {
        dragElement.style.boxShadow = 'inset 0 0 0 1px red';
    }

    function onDrop({ detail: { data } }: CustomEvent<DragEvent<InventoryDragData>>): void {
        if (!isDroppable || !data) return;
        isDroppable = false;
        updateInventory(data.index, index, slot, data.rotated);
    }

    function onDragStart(): void {
        isDragging = true;
    }

    function onRotateKey(e: CustomEvent<KeyboardDragEvent<KeyboardEvent>>): void {
        const { dragElement, keyboardEvent }: Readonly<KeyboardDragEvent<KeyboardEvent>> = e.detail;

        if (referenceItem!.width === referenceItem!.height || keyboardEvent.code !== 'Space')
            return e.preventDefault();

        dragState.rotated = !dragState.rotated;

        const dragElementStyle: CSSStyleDeclaration = dragElement.style;
        const dragImageElementStyle: CSSStyleDeclaration = (dragElement.firstElementChild as HTMLDivElement).style;

        dragElementStyle.width = `${size * (dragState.rotated ? referenceItem!.height : referenceItem!.width)}px`;
        dragElementStyle.height = `${size * (dragState.rotated ? referenceItem!.width : referenceItem!.height)}px`;

        dragImageElementStyle.transform = `rotate(${dragState.rotated ? -90 : 0}deg)`;
    }

    function onDragEnd(): void {
        isDragging = false;
        dragState.rotated = item!.rotated;
    }
</script>

<DropTarget
    on:dragEnter={onDragEnter}
    on:dragLeave={onDragLeave}
    on:drop={onDrop}
>
    <div class='slot'>
        {#if item}
            <DragDropContainer
                data={dragState}
                targetKey={referenceItem.type}
                on:dragStart={onDragStart}
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
                        style:width='{size * referenceItem.width}px'
                        style:height='{size * referenceItem.height}px'
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