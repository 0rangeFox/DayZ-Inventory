<script lang='ts'>
    import { beforeUpdate, getContext, onMount } from 'svelte';
    import type { Writable } from 'svelte/store';
    import type { InventorySizesContext, InventorySlotsProps } from '../../lib/models';
    import { sizeKey } from './Inventory.svelte';
    import { deserialize, serialize } from '../../lib/utils/JsonUtil';
    import { InventorySlotPropsSchema, InventorySlotsPropsSchema, MAX_SLOT_X, MAX_SLOT_Y } from '../../lib/models';
    import Slot from './InventorySlotsSlot.svelte';

    export let height: number = MAX_SLOT_Y;
    export let data: string;

    const { subscribe }: Writable<InventorySizesContext> = getContext<Writable<InventorySizesContext>>(sizeKey);
    let size: number = 0;

    let slots: ReadonlyArray<InventorySlotsProps> = [];

    beforeUpdate(() => {
        slots = deserialize(InventorySlotsPropsSchema)(data);
    });

    onMount(() => subscribe(({ slot }) => size = slot));
</script>

<svelte:options immutable />

<div class='container'>
    <div
        class='grid'
        style='--size: {size}px; --width: {MAX_SLOT_X}; --height: {height};'
    >
        {#each slots as { id, data } (id)}
            <Slot {size} data={serialize(InventorySlotPropsSchema)(data)} />
        {/each}
    </div>
</div>

<style lang='scss'>
    .container {
        background-color: rgba(23, 23, 23, .85);
        backdrop-filter: blur(2px);

        .grid {
            $size: var(--size);
            $width: var(--width);
            $height: var(--height);
            $border: 1px solid rgba(111, 111, 111, .4);

            width: calc($width * $size);
            height: calc($height * $size);

            display: grid;
            grid-template: repeat($height, $size) / repeat($width, $size);
        }
    }
</style>