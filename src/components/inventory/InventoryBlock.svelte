<script lang='ts'>
    import InventoryHeader from './InventoryHeader.svelte';
    import InventoryGrid from './InventoryGrid.svelte';
    import { getItemById } from '../../lib/stores/InventoryStore';
    import type { BlockIndexes, InventoryBlock, Item } from '../../lib/models';
    import { generateGrid, getIndexesById, IndexType } from '../../lib/utils/InventoryUtil';

    export let block: Readonly<InventoryBlock>;
    const index: Readonly<BlockIndexes> = getIndexesById(block.id, IndexType.BLOCK)!;
    const item: Readonly<Item> = getItemById(block.item);
    let grid: (string | null)[];

    $: grid = generateGrid(item.id, block.items);
</script>

<div class='block'>
    <InventoryHeader {item} />
    <InventoryGrid {index} width={item.freeWidth} height={item.freeHeight} {grid} items={block.items} />
</div>