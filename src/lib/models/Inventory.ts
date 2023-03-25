import type { InventoryBlock } from '.';
import type { JTDSchemaType } from 'ajv/dist/jtd';
import { InventoryBlockSchema } from './InventoryBlock';

enum InventoryType {
    VICINITY,
    HAND,
    PLAYER
}

interface InventorySizesContext {
    inventory: number;
    slot: number;
    grid: number;
}

interface Inventory {
    type: InventoryType;
    blocks: InventoryBlock[];
}

const InventorySchema: JTDSchemaType<Inventory> = {
    properties: {
        type: { type: 'int8' },
        blocks: { elements: InventoryBlockSchema }
    }
}

export default Inventory;
export type { InventorySizesContext };
export { InventoryType, InventorySchema };
