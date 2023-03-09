<script lang='ts'>
    import type { BlockIndexes, InventoryItem } from '../../lib/models';
    import { innerDimensions } from '../../lib/utils/GraphicUtil';
    import { MAX_GRID_X } from '../../lib/models';
    import InventorySlot from './InventorySlot.svelte';

    export let index: Readonly<BlockIndexes>;
    export let width: number;
    export let height: number;
    export let grid: (string | null)[];
    export let items: Readonly<InventoryItem[]>;

    let containerElement: HTMLDivElement;
    let containerWidth: number;

    // The ".1" is for the items when dragging begins so that they don't collide with whatever is on their left.
    $: size = containerWidth && innerDimensions(containerElement).width / MAX_GRID_X - .1;
</script>

<div
    bind:this={containerElement}
    bind:clientWidth={containerWidth}
    class='container'
>
    <div
        class='grid'
        style='--size: {size}px; --width: {width}; --height: {height};'
    >
        {#each grid as _, slot}
            <InventorySlot index={{ ...index, slot }} {size} item={items.find((item) => item.slot === slot)} />
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