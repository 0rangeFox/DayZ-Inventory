import type { JTDSchemaType } from 'ajv/dist/jtd';

const enum GeneralType {
    NONE
}

const enum ClothingType {
    HAT = 1,
    TOP_FIRST_LAYER,
    TOP_SECOND_LAYER,
    KEVLAR,
    HAND,
    BACKPACK,
    BOTTOM,
    FEET
}

const enum WeaponType {
    MELEE = 9,
    HANDGUN,
    SUBMACHINE_GUN,
    SHOTGUN,
    ASSAULT_RIFLE,
    LIGHT_MACHINE_GUN,
    SNIPER_RIFLE,
    HEAVY_WEAPON,
    THROWABLE,
    MISCELLANEOUS
}

interface Item {
    // Identifier
    id: number;

    // Information
    name: string;
    image: string;

    // Size
    width: number;
    height: number;
    weight: number;
    limit: number;

    // Type
    type: GeneralType | ClothingType | WeaponType;

    // Free sizes
    freeWidth: number;
    freeHeight: number;
    freeWeight: number;
}

interface InventoryItem {
    // Identifier
    id: string;

    // Information
    item: number;
    amount: number;
    data?: Record<string, string>;

    // Grid
    slot: number;
    rotated: boolean;
}

const InventoryItemSchema: JTDSchemaType<InventoryItem> = {
    properties: {
        id: { type: 'string' },
        item: { type: 'uint8' },
        amount: { type: 'uint8' },
        slot: { type: 'uint8' },
        rotated: { type: 'boolean' }
    },
    optionalProperties: {
        data: { values: { type: 'string' } }
    }
}

export default InventoryItem;
export type { Item };
export { GeneralType, ClothingType, WeaponType, InventoryItemSchema };
