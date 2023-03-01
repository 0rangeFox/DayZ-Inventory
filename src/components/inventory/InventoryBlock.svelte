<script lang='ts'>
    import InventoryHeader from './InventoryHeader.svelte';
    import InventoryGrid from './InventoryGrid.svelte';
    import type { InventoryBlock, Item } from '../../lib/models';
    import { getItemById } from '../../lib/stores/InventoryStore';

    export let block: InventoryBlock;
    let item: Item = getItemById(block.item);
</script>

<div class='block'>
    <InventoryHeader {item} />
    <InventoryGrid {item} {block} />
</div>