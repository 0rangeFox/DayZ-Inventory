<script lang='ts'>
    import type { InventoryBlock, Item } from '../../lib/models';
    import { generateGridFromBlock } from '../../lib/utils/InventoryUtil';
    import { innerDimensions } from '../../lib/utils/GraphicUtil';
    import { MAX_GRID_X } from '../../lib/models';
    import InventorySlot from './InventorySlot.svelte';

    export let inventoryId: number;
    export let blockId: number;

    export let item: Item;
    export let block: InventoryBlock;
    let gridItems: (string | null)[];

    let containerElement: HTMLDivElement;
    let containerWidth: number;

    $: gridItems = generateGridFromBlock(block);

    // The ".1" is for the items when dragging begins so that they don't collide with whatever is on their left.
    $: slotSize = containerWidth && innerDimensions(containerElement).width / MAX_GRID_X - .1;
</script>

<div
    bind:this={containerElement}
    bind:clientWidth={containerWidth}
    class='container'
>
    <div
        class='grid'
        style='--size: {slotSize}px; --width: {item.freeWidth}; --height: {item.freeHeight};'
    >
        {#each gridItems as _, slot}
            <InventorySlot {inventoryId} {blockId} grid={gridItems} gridWidth={item.freeWidth} size={slotSize} {slot} item={block.items.find((item) => item.slot === slot)} />
        {/each}
    </div>
</div>

<style lang='scss'>
    @import '../../variables.module.scss';

    .container {
        background-color: rgba(23, 23, 23, .85);
        backdrop-filter: blur(2px);
        padding-right: 5%;

        .grid {
            $size: var(--size);
            $width: var(--width);
            $height: var(--height);
            $border: 1px solid rgba(111, 111, 111, .4);

            width: calc($width * $size + 1px);
            height: calc($height * $size + 1px);

            display: grid;
            grid-template: repeat($height, $size) / repeat($width, $size);

            border-top: $border;
            border-left: $border;

            :global(.slot) {
                border-right: $border;
                border-bottom: $border;
            }
        }
    }
</style>