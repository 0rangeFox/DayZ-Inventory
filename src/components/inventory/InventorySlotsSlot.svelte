<script lang='ts'>
    import { beforeUpdate, getContext, onMount } from 'svelte';
    import type { Writable } from 'svelte/store';
    import type {
        InventoryBlockIndexes,
        InventoryDragData,
        InventorySizesContext,
        InventorySlot,
        InventorySlotProps,
        Item
    } from '../../lib/models';
    import { sizeKey } from './Inventory.svelte';
    import { deserialize } from '../../lib/utils/JsonUtil';
    import { InventorySlotPropsSchema} from '../../lib/models';
    import { getItemById, updateInventory } from '../../lib/stores/InventoryStore';
    import { canSwapSlot, getInventoryBlockByIndexes } from '../../lib/utils/InventoryUtil';
    import type { DragEvent, KeyboardDragEvent } from '../../lib/dnd/models';
    import DropTarget from '../dnd/DropTarget.svelte';
    import DragDropContainer from '../dnd/DragDropContainer.svelte';

    export let size: number;
    export let data: string;

    const { subscribe }: Writable<InventorySizesContext> = getContext<Writable<InventorySizesContext>>(sizeKey);
    let slotSize: number = 0;

    let index: Readonly<InventoryBlockIndexes>;
    let slot: Readonly<InventorySlot> | null;
    let item: Readonly<Item> | null;

    let isDragging: boolean = false;
    let dragState: InventoryDragData;
    let isDroppable: boolean = false;

    beforeUpdate(() => {
        if (isDragging) return;

        const props: Readonly<InventorySlotProps> = deserialize(InventorySlotPropsSchema)(data);
        index = props.index;
        slot = props.slot;
        item = index.block > -1 ? getItemById(getInventoryBlockByIndexes(index).item) : null;
        dragState = { index, rotated: false };

        console.log('Slot Item ID:', item?.id, index);
    });

    onMount(() => subscribe(({ grid }) => slotSize = grid));

    function onDragEnter({ detail: { data, dragElement } }: CustomEvent<DragEvent<InventoryDragData>>): void {
        if (slot && data && canSwapSlot(data.index, index, slot.type)) {
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
        updateInventory(data.index, index, -1, false);
    }

    function onDragStart({ detail: { dragElement } }: CustomEvent<DragEvent<any>>): void {
        isDragging = true;

        const width: string = `${slotSize * item!.width}px`;
        const height: string = `${slotSize * item!.height}px`;

        const dragElementStyle: CSSStyleDeclaration = dragElement.style;
        const dragImageElementStyle: CSSStyleDeclaration = (dragElement.firstElementChild as HTMLDivElement).style;

        dragElementStyle.width = width;
        dragElementStyle.height = height;
        dragElementStyle.backgroundColor = 'rgba(80, 80, 80, .6)';

        dragImageElementStyle.width = width;
        dragImageElementStyle.height = height;
        dragImageElementStyle.boxSizing = 'border-box';
        dragImageElementStyle.padding = '5%';
    }

    function onRotateKey(e: CustomEvent<KeyboardDragEvent<KeyboardEvent>>): void {
        const { dragElement, keyboardEvent }: Readonly<KeyboardDragEvent<KeyboardEvent>> = e.detail;

        if (item!.width === item!.height || keyboardEvent.code !== 'Space')
            return e.preventDefault();

        dragState.rotated = !dragState.rotated;

        const dragElementStyle: CSSStyleDeclaration = dragElement.style;
        const dragImageElementStyle: CSSStyleDeclaration = (dragElement.firstElementChild as HTMLDivElement).style;

        dragElementStyle.width = `${slotSize * (dragState.rotated ? item!.height : item!.width)}px`;
        dragElementStyle.height = `${slotSize * (dragState.rotated ? item!.width : item!.height)}px`;

        dragImageElementStyle.transform = `rotate(${dragState.rotated ? -90 : 0}deg)`;
    }

    function onDragEnd(): void {
        isDragging = false;
        dragState.rotated = false;
    }
</script>

<svelte:options immutable />

<DropTarget
    on:dragEnter={onDragEnter}
    on:dragLeave={onDragLeave}
    on:drop={onDrop}
>
    <div
        class='slot'
        style:background-image={slot && !item ? `url("/images/inventory/slots/${slot.image}.png")` : 'none'}
    >
        {#if item}
            <DragDropContainer
                data={dragState}
                targetKey={item.type}
                on:dragStart={onDragStart}
                on:key={onRotateKey}
                on:dragEnd={onDragEnd}
                hideCursor
            >
                <div class='item'>
                    <div
                        class='img'
                        style:width='{size}px'
                        style:height='{size}px'
                        style:background-image='url("/images/inventory/items/{item.image}.png")'
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

        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        background-origin: content-box;

        box-sizing: border-box;
        padding: 10%;
    }

    .item {
        width: inherit;
        height: inherit;

        display: flex;
        justify-content: center;
        align-items: center;

        .img {
            background-position: center;
            background-size: contain;
            background-repeat: no-repeat;
            background-origin: content-box;
        }
    }
</style>