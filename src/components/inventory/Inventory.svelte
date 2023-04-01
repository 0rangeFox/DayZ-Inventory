<script lang='ts' context='module'>
    import { SvelteComponent } from 'svelte';
    import { InventoryType } from '../../lib/models';
    import VicinityInventory from './types/VicinityInventory.svelte';
    import HandInventory from './types/HandInventory.svelte';
    import PlayerInventory from './types/PlayerInventory.svelte';

    interface InventoryData {
        type: InventoryType;
        title: string;
        component: SvelteComponent;
    }

    export const sizeKey: symbol = Symbol('size');

    const inventories: ReadonlyArray<InventoryData> = [
        { type: InventoryType.VICINITY, title: 'Vicinity', component: VicinityInventory },
        { type: InventoryType.HAND, title: 'Hand', component: HandInventory },
        { type: InventoryType.PLAYER, title: 'Player', component: PlayerInventory }
    ];
</script>

<script lang='ts'>
    import { setContext } from 'svelte';
    import type { Writable } from 'svelte/store';
    import { writable } from 'svelte/store';
    import type { InventorySizesContext } from '../../lib/models';
    import { MAX_GRID_X, MAX_SLOT_X } from '../../lib/models';

    let inventoryWidth: number = 0;
    const sizes: Writable<InventorySizesContext> = writable<InventorySizesContext>({ inventory: 0, slot: 0, grid: 0 });
    setContext<Writable<InventorySizesContext>>(sizeKey, sizes);

    function generateSizes(width: number): InventorySizesContext {
        const inventoryMaxWidthPercent: number = .3; // Means 30%
        const inventoryPadding: number = .02; // Means 2%

        const inventory: number = width * (inventoryMaxWidthPercent - inventoryPadding);
        const gridPadding: number = inventory * .05; // Means 5%

        return {
            inventory,
            slot: inventory / MAX_SLOT_X,
            grid: (inventory - gridPadding) / MAX_GRID_X
        };
    }

    $: sizes.set(generateSizes(inventoryWidth));
</script>

<svelte:options immutable />

<div
    class='inventories'
    bind:clientWidth={inventoryWidth}
>
    {#each inventories as { type, title, component }, inventory (type)}
        <div class='inventory'>
            <div class='header'>{title}</div>
            <svelte:component this={component} index={{ inventory }} />
        </div>
    {/each}
</div>

<style lang='scss'>
    @import '../../lib/styles/scrollbar';

    .inventories {
        height: 100%;

        display: flex;
        justify-content: space-between;

        padding: 2%;
        box-sizing: border-box;

        :nth-child(even) {
            align-self: flex-end;
        }

        .inventory {
            width: 30%;

            display: flex;
            flex-direction: column;

            .header {
                height: 5vh;
                line-height: 5vh;

                display: flex;
                align-items: center;
                justify-content: center;

                background-color: rgba(0, 0, 0, .95);
                backdrop-filter: blur(5px);
            }
        }
    }
</style>