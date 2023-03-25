<script lang='ts' context='module'>
    import type { InventoryBlock as IInventoryBlock, Item } from '../../lib/models';
    import { InventoryType } from '../../lib/models';
    import { getItemById } from '../../lib/stores/InventoryStore';

    type InventoryBlockTuple = [ number, Readonly<IInventoryBlock> ];

    export const sizeKey: symbol = Symbol('size');

    function getInventoryNameByType(type: InventoryType) {
        switch (type) {
            case InventoryType.VICINITY: return 'Vicinity';
            case InventoryType.HAND: return 'Hand';
            case InventoryType.PLAYER: return  'Player';
            default: 'Error';
        }
    }

    function orderByItemType([, a]: InventoryBlockTuple, [, b]: InventoryBlockTuple): number {
        const itemA: Readonly<Item> = getItemById(a.item);
        const itemB: Readonly<Item> = getItemById(b.item);

        if (itemA.type < itemB.type) return -1;
        else if (itemA.type > itemB.type) return 1;
        else return 0;
    }

    function getOrderedBlocksByType(type: InventoryType, blocks: ReadonlyArray<IInventoryBlock>): ReadonlyArray<InventoryBlockTuple> {
        const blockTuples: InventoryBlockTuple[] = blocks.map((block, index) => [index, block]);

        if (type !== InventoryType.PLAYER)
            return blockTuples;

        blockTuples.sort(orderByItemType);
        return blockTuples;
    }
</script>

<script lang='ts'>
    import { beforeUpdate, setContext } from 'svelte';
    import type { Writable } from 'svelte/store';
    import { writable } from 'svelte/store';
    import type { InventoryIndex, InventoryProps, InventorySizesContext } from '../../lib/models';
    import { deserialize, serialize } from '../../lib/utils/JsonUtil';
    import { InventoryBlockPropsSchema, InventoryPropsSchema, MAX_GRID_X, MAX_SLOT_X } from '../../lib/models';
    import InventorySlotGrid from './InventorySlots.svelte';
    import InventoryBlock from './InventoryBlock.svelte';

    export let type: InventoryType;
    export let data: string;

    let index: Readonly<InventoryIndex>;
    let blocks: ReadonlyArray<IInventoryBlock>;

    let inventoryWidth: number = 0;
    const size: Writable<InventorySizesContext> = writable<InventorySizesContext>({
        inventory: 0,
        slot: 0,
        grid: 0
    });
    setContext<Writable<InventorySizesContext>>(sizeKey, size);

    beforeUpdate(() => {
        const props: Readonly<InventoryProps> = deserialize(InventoryPropsSchema)(data);
        index = props.index;
        blocks = props.blocks;

        console.log('Inventory ID:', index.inventory, blocks);
    });

    $: size.set({
        inventory: inventoryWidth,
        slot: inventoryWidth / MAX_SLOT_X,
        grid: (inventoryWidth - (5 / 100) * inventoryWidth) / MAX_GRID_X
    });
</script>

<svelte:options immutable />

<div
    class='inventory'
    bind:clientWidth={inventoryWidth}
>
    <div class='header'>
        {getInventoryNameByType(type)}
    </div>
    {#if type === InventoryType.HAND}
        <section class='hand'>

        </section>
    {:else}
        <section class='slots'>
            <InventorySlotGrid {type} {index} />
        </section>
        <section class='blocks'>
            {#each getOrderedBlocksByType(type, blocks) as [ id, block ] (block.id)}
                <InventoryBlock data={serialize(InventoryBlockPropsSchema)({ index: { ...index, block: id }, block })} />
            {/each}
        </section>
    {/if}
</div>

<style lang='scss'>
    .inventory {
        width: 30%;

        display: flex;
        flex-direction: column;

        .header {
            height: 5vh;

            display: flex;
            align-items: center;
            justify-content: center;

            background-color: rgba(0, 0, 0, .95);
            backdrop-filter: blur(5px);
        }

        .slots {
            margin-bottom: 5%;
        }

        .blocks {
            overflow-y: auto;

            :first-child {
              direction: rtl;
            }

            :global(.block:first-child) {
                direction: ltr;
            }

            :global(.block + .block) {
                margin-top: 5%;
            }
        }

        .hand {
            height: 25vh;
            background-color: rgba(0, 0, 0, .65);
            backdrop-filter: blur(2px);
        }
    }

    /* Width */
    ::-webkit-scrollbar {
        width: 5px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px grey;
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, .3);
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, .6);
    }
</style>