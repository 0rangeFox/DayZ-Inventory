import type { InventoryBlockIndexes, InventoryIndex, InventoryItemIndexes } from '.';

interface InventoryDragData {
    index: InventoryBlockIndexes | InventoryItemIndexes;
    rotated: boolean;
}

function isInventoryIndex(index: InventoryIndex | InventoryBlockIndexes | InventoryItemIndexes): index is InventoryIndex {
    return 'inventory' in index && !('block' in index) && !('item' in index);
}

function isInventoryItemDragData(index: InventoryIndex | InventoryBlockIndexes | InventoryItemIndexes): index is InventoryItemIndexes {
    return 'item' in index;
}

export default InventoryDragData;
export { isInventoryIndex, isInventoryItemDragData };
