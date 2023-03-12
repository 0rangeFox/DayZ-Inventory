import type { InventoryBlock } from '.';
import type { JTDSchemaType } from 'ajv/dist/jtd';
import { InventoryBlockSchema } from './InventoryBlock';

enum InventoryType {
    VICINITY,
    HAND,
    PLAYER
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
export { InventoryType, InventorySchema };
