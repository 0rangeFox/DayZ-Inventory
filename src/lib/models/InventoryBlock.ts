import { MAX_GRID_X, MAX_GRID_Y } from '../styles/variables.module.scss';
import type { InventoryItem } from '.';
import type { JTDSchemaType } from 'ajv/dist/jtd';
import { InventoryItemSchema } from './InventoryItem';

interface InventoryBlock {
    // Identifier
    id: string;

    // Information
    item: number;

    // Items stored
    items: InventoryItem[];
}

const InventoryBlockSchema: JTDSchemaType<InventoryBlock> = {
    properties: {
        id: { type: 'string' },
        item: { type: 'uint8' },
        items: { elements: InventoryItemSchema }
    }
}

export default InventoryBlock;
export { MAX_GRID_X, MAX_GRID_Y, InventoryBlockSchema };
