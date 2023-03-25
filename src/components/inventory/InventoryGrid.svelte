<script lang='ts' context='module'>
    import type { InventoryItemIndexes } from '../../lib/models';

    interface GridSlotData {
        id: string;
        index: InventoryItemIndexes;
    }
</script>

<script lang='ts'>
    import { beforeUpdate, getContext, onMount } from 'svelte';
    import type { Writable } from 'svelte/store';
    import { sizeKey } from './Inventory.svelte';
    import type { InventoryBlockIndexes, InventoryGridProps, InventorySizesContext } from '../../lib/models';
    import { InventoryGridSlotPropsSchema, InventoryGridPropsSchema } from '../../lib/models';
    import { deserialize, serialize } from '../../lib/utils/JsonUtil';
    import Slot from './InventoryGridSlot.svelte';

    export let data: string;

    const { subscribe }: Writable<InventorySizesContext> = getContext<Writable<InventorySizesContext>>(sizeKey);

    let index: Readonly<InventoryBlockIndexes>;
    let width: number;
    let height: number;
    let grid: GridSlotData[];
    let size: number = 0;

    beforeUpdate(() => {
        const { items, ...props }: Readonly<InventoryGridProps> = deserialize(InventoryGridPropsSchema)(data);
        index = props.index;
        width = props.width;
        height = props.height;

        grid = new Array<GridSlotData>(width * height);
        for (let slot = 0; slot < grid.length; slot++) {
            const item: number = items.findIndex((item) => item.slot === slot);
            grid[slot] = { id: item !== -1 ? items[item].id : slot, index: { ...index, item } }
        }

        console.log('Grid ID:', index);
    });

    onMount(() => subscribe(({ grid }) => size = grid));
</script>

<svelte:options immutable />

<div class='container'>
    <div
        class='grid'
        style='--size: {size}px; --width: {width}; --height: {height};'
    >
        {#each grid as { id, index }, slot (id)}
            <Slot {size} data={serialize(InventoryGridSlotPropsSchema)({ index, slot })} />
        {/each}
    </div>
</div>

<style lang='scss'>
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