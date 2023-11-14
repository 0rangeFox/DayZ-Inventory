import { MAX_SLOT_X, MAX_SLOT_Y } from '../styles/variables.module.scss';
import type { InventoryBlockIndexes } from '.';
import { ClothingType, WeaponType } from './InventoryItem';
import { InventoryBlockIndexSchema } from './InventoryIndexes';
import type { JTDSchemaType } from 'ajv/dist/jtd';

interface InventorySlot {
    image: string;
    type: ClothingType | WeaponType;
}

interface InventorySlotProps {
    index: Readonly<InventoryBlockIndexes>;
    slot: Readonly<InventorySlot> | null;
}

interface InventorySlotsProps {
    id?: string;
    data: Readonly<InventorySlotProps>;
}

const InventorySlotSchema: JTDSchemaType<InventorySlot> = {
    properties: {
        image: { type: 'string' },
        type: { type: 'uint8' }
    }
}

const InventorySlotPropsSchema: JTDSchemaType<InventorySlotProps> = {
    properties: {
        index: InventoryBlockIndexSchema,
        slot: { ...InventorySlotSchema, nullable: true }
    }
}

const InventorySlotsSchema: JTDSchemaType<InventorySlotsProps> = {
    properties: {
        data: InventorySlotPropsSchema
    },
    optionalProperties: {
        id: { type: 'string' }
    }
}

const InventorySlotsPropsSchema: JTDSchemaType<ReadonlyArray<InventorySlotsProps>> = {
    elements: InventorySlotsSchema
}

const SLOTS: InventorySlot[] = [
    { image: 'hat', type: ClothingType.HAT },
    { image: 'top_first_layer', type: ClothingType.TOP_FIRST_LAYER },
    { image: 'top_second_layer', type: ClothingType.TOP_SECOND_LAYER },
    { image: 'kevlar', type: ClothingType.KEVLAR },
    { image: 'hand', type: ClothingType.HAND },
    { image: 'backpack', type: ClothingType.BACKPACK },
    { image: 'bottom', type: ClothingType.BOTTOM },
    { image: 'feet', type: ClothingType.FEET }
];

export default InventorySlot;
export type { InventorySlotProps, InventorySlotsProps };
export {
    MAX_SLOT_X,
    MAX_SLOT_Y,
    InventorySlotSchema,
    InventorySlotsSchema,
    InventorySlotPropsSchema,
    InventorySlotsPropsSchema,
    SLOTS
};
