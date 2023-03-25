<script lang='ts'>
    import { beforeUpdate, getContext, onMount } from 'svelte';
    import type { Writable } from 'svelte/store';
    import type { InventoryBlock, InventoryIndex, InventorySizesContext, Item } from '../../lib/models';
    import { sizeKey } from './Inventory.svelte';
    import { ClothingType, InventorySlotPropsSchema, InventoryType, MAX_SLOT_X, MAX_SLOT_Y, SLOTS, WeaponType } from '../../lib/models';
    import { getItemById, inventories } from '../../lib/stores/InventoryStore';
    import Slot from './InventorySlotsSlot.svelte';
    import { serialize } from '../../lib/utils/JsonUtil';

    export let type: InventoryType;
    export let index: InventoryIndex;

    const { subscribe }: Writable<InventorySizesContext> = getContext<Writable<InventorySizesContext>>(sizeKey);
    let size: number = 0;

    let playerBlocks: Map<WeaponType | ClothingType, number> = new Map<WeaponType | ClothingType, number>();
    let vicinityBlocks: number[] = [];

    beforeUpdate(() => {
        const blocks: ReadonlyArray<InventoryBlock> = $inventories[index.inventory].blocks;

        if (type === InventoryType.PLAYER) {
            playerBlocks = new Map<WeaponType | ClothingType, number>();
            for (let i = 0; i < blocks.length; i++) {
                const { type }: Readonly<Item> = getItemById(blocks[i].item);
                playerBlocks[type] = i;
            }
        } else {
            vicinityBlocks = [];
            for (let i = 0; i < blocks.length; i++)
                vicinityBlocks.push(i);
        }
    });

    onMount(() => subscribe(({ slot }) => size = slot));
</script>

<svelte:options immutable />

<div class='container'>
    <div
        class='grid'
        style='--size: {size}px; --width: {MAX_SLOT_X}; --height: {type === InventoryType.PLAYER ? MAX_SLOT_Y : Math.ceil(vicinityBlocks.length / MAX_SLOT_X)};'
    >
        {#if type === InventoryType.PLAYER}
            {#each SLOTS as slot (slot.type)}
                <Slot {size} data={serialize(InventorySlotPropsSchema)({ index: { ...index, block: playerBlocks[slot.type] ?? -1 }, slot })} />
            {/each}
        {:else}
            {#each vicinityBlocks as block}
                <Slot {size} data={serialize(InventorySlotPropsSchema)({ index: { ...index, block } })} />
            {/each}
        {/if}
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