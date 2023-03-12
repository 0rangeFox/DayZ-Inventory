<script lang='ts' context='module'>
    import type { InventoryItemIndexes } from '../../lib/models';

    interface GridSlotData {
        id: string;
        index: InventoryItemIndexes;
    }
</script>

<script lang='ts'>
    import { beforeUpdate } from 'svelte';
    import type { InventoryBlockIndexes, InventoryGridProps } from '../../lib/models';
    import { innerDimensions } from '../../lib/utils/GraphicUtil';
    import { MAX_GRID_X, InventorySlotPropsSchema, InventoryGridPropsSchema } from '../../lib/models';
    import { deserialize, serialize } from '../../lib/utils/JsonUtil';
    import InventorySlot from './InventorySlot.svelte';

    export let data: string;

    let containerElement: HTMLDivElement;
    let containerWidth: number;

    let index: Readonly<InventoryBlockIndexes>;
    let width: number;
    let height: number;
    let grid: GridSlotData[];

    // The ".1" is for the items when dragging begins so that they don't collide with whatever is on their left.
    $: size = containerWidth && innerDimensions(containerElement).width / MAX_GRID_X - .1;

    beforeUpdate(() => {
        const { items, ...props }: Readonly<InventoryGridProps> = deserialize(InventoryGridPropsSchema)(data);
        index = props.index;
        width = props.width;
        height = props.height;

        grid = new Array(width * height);
        for (let slot = 0; slot < grid.length; slot++) {
            const item: number = items.findIndex((item) => item.slot === slot);
            grid[slot] = { id: item !== -1 ? items[item].id : slot, index: { ...index, item } }
        }

        console.log('Grid ID:', index);
    });
</script>

<svelte:options immutable />

<div
    bind:this={containerElement}
    bind:clientWidth={containerWidth}
    class='container'
>
    <div
        class='grid'
        style='--size: {size}px; --width: {width}; --height: {height};'
    >
        {#each grid as { id, index }, slot (id)}
            <InventorySlot {size} data={serialize(InventorySlotPropsSchema)({ index, slot })} />
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