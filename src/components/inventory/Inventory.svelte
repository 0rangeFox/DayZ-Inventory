<script lang='ts'>
    import { beforeUpdate } from 'svelte';
    import type { InventoryBlock as IInventoryBlock, InventoryIndex, InventoryProps } from '../../lib/models';
    import { deserialize, serialize } from '../../lib/utils/JsonUtil';
    import { InventoryBlockPropsSchema, InventoryPropsSchema } from '../../lib/models';
    import InventoryBlock from './InventoryBlock.svelte';

    export let data: string;

    let index: Readonly<InventoryIndex>;
    let blocks: Readonly<IInventoryBlock[]>;

    beforeUpdate(() => {
        const props: Readonly<InventoryProps> = deserialize(InventoryPropsSchema)(data);
        index = props.index;
        blocks = props.blocks;

        console.log('Inventory ID:', index.inventory)
    });
</script>

<svelte:options immutable />

<section class='inventory'>
    {#each blocks as block, id (block.id)}
        <InventoryBlock data={serialize(InventoryBlockPropsSchema)({ index: { ...index, block: id }, block })} />
    {/each}
</section>

<style lang='scss'>
    .inventory {
        width: 30%;
        max-height: 90%;

        overflow-y: scroll;

        :global(.block + .block) {
            margin-top: 5%;
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