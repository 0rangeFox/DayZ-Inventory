import type { InventoryIndex, InventoryBlockIndexes, InventoryBlock, InventoryItemIndexes, InventoryItem } from '.';
import type { JTDSchemaType } from 'ajv/dist/jtd';
import { InventoryIndexSchema, InventoryBlockIndexSchema, InventoryItemIndexSchema } from './InventoryIndexes';
import { InventoryBlockSchema } from './InventoryBlock';
import { InventoryItemSchema } from './InventoryItem';

interface InventoryProps {
    index: Readonly<InventoryIndex>;
    blocks: ReadonlyArray<InventoryBlock>;
}

interface InventoryBlockProps {
    index: Readonly<InventoryBlockIndexes>;
    block: Readonly<InventoryBlock>;
}

interface InventoryGridProps {
    index: Readonly<InventoryBlockIndexes>;
    width: number;
    height: number;
    items: ReadonlyArray<InventoryItem>;
}

interface InventoryGridSlotProps {
    index: Readonly<InventoryItemIndexes>;
    slot: number;
}

const InventoryPropsSchema: JTDSchemaType<InventoryProps> = {
    properties: {
        index: InventoryIndexSchema,
        blocks: { elements: InventoryBlockSchema }
    }
}

const InventoryBlockPropsSchema: JTDSchemaType<InventoryBlockProps> = {
    properties: {
        index: InventoryBlockIndexSchema,
        block: InventoryBlockSchema
    }
}

const InventoryGridPropsSchema: JTDSchemaType<InventoryGridProps> = {
    properties: {
        index: InventoryBlockIndexSchema,
        width: { type: 'uint8' },
        height: { type: 'uint8' },
        items: { elements: InventoryItemSchema }
    }
}

const InventoryGridSlotPropsSchema: JTDSchemaType<InventoryGridSlotProps> = {
    properties: {
        index: InventoryItemIndexSchema,
        slot: { type: 'uint8' }
    }
}

export type { InventoryProps, InventoryBlockProps, InventoryGridProps, InventoryGridSlotProps };
export { InventoryPropsSchema, InventoryBlockPropsSchema, InventoryGridPropsSchema, InventoryGridSlotPropsSchema };