import type { InventoryBlockIndexes, InventoryItemIndexes } from '.';

interface InventoryDragData {
    index: InventoryBlockIndexes | InventoryItemIndexes;
    rotated: boolean;
}

function isInventoryItemDragData(index: InventoryBlockIndexes | InventoryItemIndexes): index is InventoryItemIndexes {
    return 'item' in index;
}

export default InventoryDragData;
export { isInventoryItemDragData };
