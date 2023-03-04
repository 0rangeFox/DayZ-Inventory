<script lang='ts'>
    import DragDropContainer from '../dnd/DragDropContainer.svelte';
    import DropTarget from '../dnd/DropTarget.svelte';
    import type { InventoryItem, Item } from '../../lib/models';
    import { getItemById } from '../../lib/stores/InventoryStore';
    import type { DragEvent, KeyboardDragEvent } from '../../lib/dnd/models';

    export let size: number;
    export let slot: number;
    export let item: InventoryItem | null;
    const referenceItem: Item | null = item ? getItemById(item.item) : null;

    function onDragEnter({ detail: { dragElement } }: CustomEvent<DragEvent<InventoryItem>>) {
        dragElement.style.boxShadow = '0 0 0 1px green inset';
    }

    function onDragLeave({ detail: { dragElement } }: CustomEvent<DragEvent<InventoryItem>>) {
        dragElement.style.boxShadow = '0 0 0 1px red inset';
    }

    function onRotateKey({ detail: { dragElement, keyboardEvent } }: CustomEvent<KeyboardDragEvent<KeyboardEvent>>) {
        if (keyboardEvent.code === 'Space') {
            item!.rotated = !item!.rotated;

            const dragElementStyle: CSSStyleDeclaration = dragElement.style;
            const dragImageElementStyle: CSSStyleDeclaration = (dragElement.firstElementChild as HTMLDivElement).style;

            dragElementStyle.width = `${size * (item.rotated ? referenceItem.height : referenceItem.width)}px`;
            dragElementStyle.height = `${size * (item.rotated ? referenceItem.width : referenceItem.height)}px`;

            dragImageElementStyle.transform = `rotate(${item!.rotated ? -90 : 0}deg)`;
        }
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
                on:key={onRotateKey}
                on:drag={onDrag}
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