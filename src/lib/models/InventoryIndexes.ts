import type { JTDSchemaType } from 'ajv/dist/jtd';

interface InventoryIndex {
    inventory: number;
}

interface InventoryBlockIndexes extends InventoryIndex {
    block: number;
}

interface InventoryItemIndexes extends InventoryBlockIndexes {
    item: number;
}

const InventoryIndexSchema: JTDSchemaType<InventoryIndex> = {
    properties: {
        inventory: { type: 'uint8' }
    }
}

const InventoryBlockIndexSchema: JTDSchemaType<InventoryBlockIndexes> = {
    properties: {
        ...InventoryIndexSchema.properties,
        block: { type: 'uint8' }
    }
}

const InventoryItemIndexSchema: JTDSchemaType<InventoryItemIndexes> = {
    properties: {
        ...InventoryBlockIndexSchema.properties,
        item: { type: 'int16' }
    }
}

export type { InventoryIndex, InventoryBlockIndexes, InventoryItemIndexes };
export { InventoryIndexSchema, InventoryBlockIndexSchema, InventoryItemIndexSchema };
