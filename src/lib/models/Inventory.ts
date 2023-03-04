import type { InventoryBlock } from '.';

enum InventoryType {
    VICINITY,
    HAND,
    PLAYER
}

interface Inventory {
    type: InventoryType;
    blocks: InventoryBlock[];
}

export default Inventory;
export { InventoryType };
