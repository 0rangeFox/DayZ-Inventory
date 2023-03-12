<script lang='ts'>
    import { beforeUpdate } from 'svelte';
    import type { InventoryBlockIndexes, InventoryBlock, InventoryBlockProps, Item } from '../../lib/models';
    import { deserialize, serialize } from '../../lib/utils/JsonUtil';
    import { InventoryBlockPropsSchema, InventoryGridPropsSchema } from '../../lib/models';
    import { getItemById } from '../../lib/stores/InventoryStore';
    import InventoryHeader from './InventoryHeader.svelte';
    import InventoryGrid from './InventoryGrid.svelte';

    export let data: string;

    let index: Readonly<InventoryBlockIndexes>;
    let block: Readonly<InventoryBlock>;
    let item: Readonly<Item>;

    beforeUpdate(() => {
        const props: Readonly<InventoryBlockProps> = deserialize(InventoryBlockPropsSchema)(data);
        index = props.index;
        block = props.block;
        item = getItemById(block.item);

        console.log('Block ID:', block.id)
    });
</script>

<svelte:options immutable />

<div class='block'>
    <InventoryHeader {item} />
    <InventoryGrid data={serialize(InventoryGridPropsSchema)({ index, width: item.freeWidth, height: item.freeHeight, items: block.items})} />
</div>