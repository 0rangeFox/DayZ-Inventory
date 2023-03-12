import { get } from 'svelte/store';
import { IS_WEB_DEBUG } from '../utils/TestUtil';
import { speedWritable } from '../helpers';
import type { Inventory, InventoryItem, InventoryItemIndexes, Item } from '../models';
import { ClothingType, GeneralType, InventoryType, WeaponType } from '../models';
import moize from 'moize';
import { deepEqual } from 'fast-equals';

const [ items ] = speedWritable<Item[]>(IS_WEB_DEBUG ? [
    { id: 1, name: 'Blue Press Vest', image: 'Blue_Press_Vest', width: 2, height: 2, weight: 0, limit: 1, type: ClothingType.KEVLAR, freeWidth: 4, freeHeight: 3, freeWeight: 0 },
    { id: 2, name: 'Wool Coat Red Check', image: 'Wool_Coat_Red_Check', width: 4, height: 3, weight: 0, limit: 1, type: ClothingType.TOP_FIRST_LAYER, freeWidth: 7, freeHeight: 4, freeWeight: 0 },
    { id: 3, name: 'Black Jeans', image: 'Black_Jeans', width: 1, height: 2, weight: 0, limit: 1, type: ClothingType.BOTTOM, freeWidth: 4, freeHeight: 2, freeWeight: 0 },
    { id: 4, name: 'Alice Backpack (Green)', image: 'AliceBackpack_Green', width: 5, height: 5, weight: 0, limit: 1, type: ClothingType.BACKPACK, freeWidth: 10, freeHeight: 10, freeWeight: 0 },
    { id: 5, name: 'AKM', image: 'AKM', width: 4, height: 2, weight: 0, limit: 1, type: WeaponType.ASSAULT_RIFLE, freeWidth: 0, freeHeight: 0, freeWeight: 0 },
    { id: 6, name: '30 Rounds Magazine', image: '30rndmag', width: 1, height: 2, weight: 0, limit: 1, type: GeneralType.NONE, freeWidth: 0, freeHeight: 0, freeWeight: 0 },
    { id: 7, name: 'Ammo 7.62x39mm', image: 'Ammo_762x39', width: 1, height: 1, weight: 0, limit: 1, type: GeneralType.NONE, freeWidth: 0, freeHeight: 0, freeWeight: 0 }
] : []);

const [ inventories, _, update ] = speedWritable<Inventory[]>(IS_WEB_DEBUG ? [
    { type: InventoryType.VICINITY, blocks: [] },
    { type: InventoryType.HAND, blocks: [] },
    {
        type: InventoryType.PLAYER,
        blocks: [
            {
                id: 'O12xT0GoSbg0Zzcf',
                item: 2,
                items: []
            },
            {
                id: 'mKKX6KP9EvhC26b2',
                item: 1,
                items: [
                    { id: 'A5rt4z3L7my98eBj', item: 6, amount: 1, slot: 0, rotated: false },
                    { id: 'J3Hl7ApS1d5Sh3OY', item: 7, amount: 5, slot: 8, rotated: false }
                ]
            },
            {
                id: '00SDvv5wJu1ykovM',
                item: 4,
                items: [
                    { id: '8W6i1WNs8a027NAk', item: 2, amount: 1, slot: 0, rotated: true },
                    { id: 'LU7x5f928bAzUa4O', item: 1, amount: 1, slot: 3, rotated: false },
                    { id: '3Jj8m40IyeLarhbo', item: 6, amount: 1, slot: 5, rotated: true }
                ]
            }
        ]
    }
] : []);

/**
 * @param id The ID of item (Not the ID generated)
 *
 * @return The item object corresponding to that ID.
 */
const getItemById = moize((id: number): Readonly<Item> => {
    const rItems: Readonly<Item[]> = get<Readonly<Item[]>>(items);
    return rItems.find(({ id: itemId }) => id === itemId)!;
});

function updateInventory(from: InventoryItemIndexes, to: InventoryItemIndexes, slot: number, rotated: boolean): void {
    return update((inventories) => {
        const updatedFrom: Readonly<InventoryItem> = { ...inventories[from.inventory].blocks[from.block].items[from.item], slot, rotated };

        if (deepEqual(from, to)) { // If is same inventory and block, means the item only was moved or rotated.
            inventories[from.inventory].blocks[from.block].items[from.item] = updatedFrom;
        } else if (inventories[to.inventory].blocks[to.block].items[to.item]) { // Check if on this slot has actually an item and then swap
            inventories[from.inventory].blocks[from.block].items[from.item] = {
                ...inventories[to.inventory].blocks[to.block].items[to.item],
                slot: inventories[from.inventory].blocks[from.block].items[from.item].slot
            };
            inventories[to.inventory].blocks[to.block].items[to.item] = updatedFrom;
        } else { // If there's no item on this slot, just move the item to new block
            inventories[from.inventory].blocks[from.block].items.splice(from.item, 1);
            inventories[to.inventory].blocks[to.block].items.push(updatedFrom);
        }

       return inventories;
    });
}

export {
    items,
    inventories,

    getItemById,
    updateInventory
};
