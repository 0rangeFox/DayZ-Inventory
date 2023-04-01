<script lang='ts'>
    import { beforeUpdate, getContext, onMount } from 'svelte';
    import type { Writable } from 'svelte/store';
    import { InventoryGridPropsSchema } from '../../../lib/models';
    import type { InventoryBlock, InventoryDragData, InventoryIndex, InventorySizesContext, Item } from '../../../lib/models';
    import { sizeKey } from '../Inventory.svelte';
    import { getItemById, inventories, updateInventory } from '../../../lib/stores/InventoryStore';
    import type { DragEvent, KeyboardDragEvent } from '../../../lib/dnd/models';
    import DropTarget from '../../dnd/DropTarget.svelte';
    import DragDropContainer from '../../dnd/DragDropContainer.svelte';
    import Grid from '../InventoryGrid.svelte';
    import { serialize } from '../../../lib/utils/JsonUtil';

    export let index: Readonly<InventoryIndex>;

    const { subscribe }: Writable<InventorySizesContext> = getContext<Writable<InventorySizesContext>>(sizeKey);

    let block: Readonly<InventoryBlock> | null = null;
    let item: Readonly<Item> | null = null;
    let slotSize: number = 0;

    let isDragging: boolean = false;
    let dragState: InventoryDragData;
    let isDroppable: boolean = false;

    beforeUpdate(() => {
        if (isDragging) return;

        block = $inventories[index.inventory].blocks[0] ?? null;
        item = block ? getItemById(block.item) : null;
        dragState = { index: { ...index, block: 0 }, rotated: false };

        console.log('Hand Item ID:', item?.id);
    });

    onMount(() => subscribe(({ grid }) => slotSize = grid));

    function onDragEnter({ detail: { dragElement } }: CustomEvent<DragEvent<InventoryDragData>>): void {
        dragElement.style.boxShadow = `inset 0 0 0 1px ${block ? 'red' : 'green'}`;
    }

    function onDragLeave({ detail: { dragElement } }: CustomEvent<DragEvent<InventoryDragData>>): void {
        dragElement.style.boxShadow = 'inset 0 0 0 1px red';
    }

    function onDrop({ detail: { data } }: CustomEvent<DragEvent<InventoryDragData>>): void {
        if (block || !data) return;
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

<DropTarget
    on:dragEnter={onDragEnter}
    on:dragLeave={onDragLeave}
    on:drop={onDrop}
>
    <section class='hand'>
        {#if block && item}
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
                        style:background-image='url("/images/inventory/items/{item.image}.png")'
                    />
                </div>
            </DragDropContainer>
            {#if !isDragging && item.freeWidth > 0 && item.freeHeight > 0}
                <Grid data={serialize(InventoryGridPropsSchema)({ index: { ...index, block: 0 }, width: item.freeWidth, height: item.freeHeight, items: block.items })} />
            {/if}
        {/if}
    </section>
</DropTarget>

<style lang='scss'>
    @import '../../../lib/styles/scrollbar';

    .hand {
        min-height: 25vh;
        max-height: 50vh;

        background-color: rgba(0, 0, 0, .65);
        backdrop-filter: blur(2px);

        overflow-y: auto;

        :global(.container) {
            background-color: unset;
            backdrop-filter: unset;
        }
    }

    .item {
        width: 100%;
        height: 25vh;

        display: flex;
        justify-content: center;
        align-items: center;

        .img {
            width: 100%;
            height: 100%;

            background-position: center;
            background-size: contain;
            background-repeat: no-repeat;
            background-origin: content-box;

            padding: 5%;
            box-sizing: border-box;
        }
    }
</style>