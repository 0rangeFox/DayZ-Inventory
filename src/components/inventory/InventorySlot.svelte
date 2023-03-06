<script lang='ts'>
    import type { InventoryItem, Item } from '../../lib/models';
    import { getItemById } from '../../lib/stores/InventoryStore';
    import type { DragEvent, KeyboardDragEvent } from '../../lib/dnd/models';
    import { canSwapItemOnGrid } from '../../lib/utils/InventoryUtil';
    import DropTarget from '../dnd/DropTarget.svelte';
    import DragDropContainer from '../dnd/DragDropContainer.svelte';

    export let grid: (string | null)[];
    export let gridWidth: number;

    export let size: number;
    export let slot: number;
    export let item: InventoryItem | null;
    const referenceItem: Item | null = item ? getItemById(item.item) : null;

    const itemState: InventoryItem | null = item ? { ...item } : null;

    function onDragEnter({ detail: { data, dragElement } }: CustomEvent<DragEvent<InventoryItem>>) {
        if (data?.id === item?.id && data?.rotated === item?.rotated)
            dragElement.style.boxShadow = '0 0 0 1px transparent inset';
        else if (data && canSwapItemOnGrid(grid, gridWidth, { ...data, slot }, item ? { ...item, slot: data.slot } : null))
            dragElement.style.boxShadow = '0 0 0 1px green inset';
        else
            dragElement.style.boxShadow = '0 0 0 1px yellow inset';
    }

    function onDragLeave({ detail: { data, dragElement } }: CustomEvent<DragEvent<InventoryItem>>) {
        //console.log('Dragged out:', data?.id === item?.id, data, item)
        if (data?.id === item?.id && data?.rotated === item?.rotated)
            dragElement.style.boxShadow = '0 0 0 1px transparent inset';
        else
            dragElement.style.boxShadow = '0 0 0 1px red inset';
    }

    function onRotateKey(e: CustomEvent<KeyboardDragEvent<KeyboardEvent>>) {
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

    function onDragEnd() {
        itemState!.rotated = item!.rotated;
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