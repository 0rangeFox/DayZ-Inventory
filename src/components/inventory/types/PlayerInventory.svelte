<script lang='ts' context='module'>
    import type { InventoryBlock, Item } from '../../../lib/models';
    import { getItemById } from '../../../lib/stores/InventoryStore';

    type InventoryBlockTuple = [ number, Readonly<InventoryBlock> ];

    function orderByItemType([, a]: InventoryBlockTuple, [, b]: InventoryBlockTuple): number {
        const itemA: Readonly<Item> = getItemById(a.item);
        const itemB: Readonly<Item> = getItemById(b.item);

        if (itemA.type < itemB.type) return -1;
        else if (itemA.type > itemB.type) return 1;
        else return 0;
    }
</script>

<script lang='ts'>
    import { beforeUpdate } from 'svelte';
    import type { InventorySlotsProps, InventoryIndex } from '../../../lib/models';
    import { ClothingType, InventorySlotsPropsSchema, InventoryBlockPropsSchema, SLOTS, WeaponType } from '../../../lib/models';
    import { inventories } from '../../../lib/stores/InventoryStore';
    import { serialize } from '../../../lib/utils/JsonUtil';
    import Slots from '../InventorySlots.svelte';
    import Block from '../InventoryBlock.svelte';

    export let index: Readonly<InventoryIndex>;

    let slots: InventorySlotsProps[] = [];
    let blocks: InventoryBlockTuple[] = [];

    beforeUpdate(() => {
        blocks = $inventories[index.inventory].blocks.map((block, index) => [index, block]);
        blocks.sort(orderByItemType);

        const playerBlocks: { [key in WeaponType | ClothingType]: number } = {};
        for (const block of blocks) {
            const { type }: Readonly<Item> = getItemById(block[1].item);
            playerBlocks[type] = block[0];
        }

        slots = SLOTS.map((slot) => ({ id: slot.type, data: { index: { ...index, block: playerBlocks[slot.type] ?? -1 }, slot } }));
    });
</script>

<section class='container'>
    <div class='slots'>
        <Slots data={serialize(InventorySlotsPropsSchema)(slots)} />
    </div>
    <div class='blocks'>
        {#each blocks as [ id, block ] (block.id)}
            <Block data={serialize(InventoryBlockPropsSchema)({ index: { ...index, block: id }, block })} />
        {/each}
    </div>
</section>

<style lang='scss'>
    @import '../../../lib/styles/scrollbar';

    .container {
        overflow-x: hidden;
        overflow-y: auto;

        .slots {
            margin-bottom: 5%;
        }

        .blocks {
            overflow-y: auto;

            :global(.block + .block) {
                margin-top: 5%;
            }
        }
    }
</style>