import { get } from 'svelte/store';
import { getItemById, inventories } from '../stores/InventoryStore';
import type { Inventory, InventoryBlock, InventoryBlockIndexes, InventoryItem, InventoryItemIndexes, Item } from '../models';
import { ClothingType, isInventoryItemDragData, WeaponType } from '../models';
import { deepEqual } from 'fast-equals';

// An array with 2 properties, the first is the grid built in array with items built in and second is width of that grid.
type GridData = [ (number | null)[], number ];

/**
 * Get the inventory block object by the indexes.
 * @param indexes Provide the indexes to get the specific block.
 *
 * @return The inventory block object.
 */
function getInventoryBlockByIndexes(indexes: Readonly<InventoryBlockIndexes>): Readonly<InventoryBlock> {
    return get<ReadonlyArray<Inventory>>(inventories)[indexes.inventory].blocks[indexes.block];
}

/**
 * Get the inventory item object by the indexes.
 * @param indexes Provide the indexes to get the specific item.
 *
 * @return The inventory item object.
 */
function getInventoryItemByIndexes(indexes: Readonly<InventoryItemIndexes>): Readonly<InventoryItem> {
    return getInventoryBlockByIndexes(indexes).items[indexes.item];
}

/**
 *
 * @param width The maximum width.
 * @param height The maximum height.
 *
 * @return Array with limited length corresponding to the limits defined.
 */
function generateEmptyGrid(width: number, height: number): null[] {
    return new Array<null>(width * height).fill(null);
}

/**
 * Generate the grid in array.
 * @param block The indexes of block to generate the grid.
 * @param ignore Insert the ID unique of items to not be placed on the grid generated.
 *
 * @return An array with 2 properties, the first is the grid built in array with items built in and second is width of that grid.
 */
function generateGrid(block: Readonly<InventoryBlockIndexes>, ignore?: ReadonlySet<number>): GridData {
    const { item, items }: Readonly<InventoryBlock> = getInventoryBlockByIndexes(block);
    const { freeWidth, freeHeight }: Readonly<Item> = getItemById(item);
    const blockGridItems: (number | null)[] = generateEmptyGrid(freeWidth, freeHeight);

    // Convert the items into indexes
    const itemsIndexes: ReadonlyArray<number> = items.map((_, i) => i);
    const filteredItems: ReadonlyArray<number> = ignore ? itemsIndexes.filter((i) => !ignore.has(i)) : itemsIndexes;

    for (let i = 0; i < filteredItems.length; i++) {
        const itemIndex: Readonly<number> = filteredItems[i];
        const { item, slot, rotated }: Readonly<InventoryItem> = items[itemIndex];
        const itemReference: Readonly<Item> = getItemById(item);
        insertItemOnGrid(blockGridItems, freeWidth, itemReference, itemIndex, slot, rotated);
    }

    return [ blockGridItems, freeWidth ];
}

/**
 * Add the item to the grid provided.
 * @param grid The grid generated related to the block.
 * @param maxWidth The max width of the grid provided.
 * @param width The item width.
 * @param height The item height.
 * @param item The item index obtained from InventoryItemIndexes. (Not the ID generated from InventoryItem nor the Item reference)
 * @param slot The slot where item is located at.
 * @param rotated The actual rotation status of item.
 */
function insertItemOnGrid(grid: (number | null)[], maxWidth: number, { width, height }: Readonly<Item>, item: number = -1, slot: number = 0, rotated: boolean = false): void {
    const itemHeight: number = rotated ? width : height;
    const itemWidth: number = rotated ? height : width;
    const maxItemWidth: number = itemWidth + slot;
    const maxItemHeight: number = itemHeight * maxWidth + slot;

    for (let slotX = slot; slotX < maxItemWidth; slotX++) // Loop through horizontally
        for (let slotY = slotX; slotY < maxItemHeight; slotY += maxWidth) // Loop through vertically
            grid[slotY] = item;
}

/**
 * Remove the item from the grid provided.
 * @param grid The grid generated related to the block.
 * @param maxWidth The max width of the grid provided.
 * @param width The item width.
 * @param height The item height.
 * @param item The item index obtained from InventoryItemIndexes. (Not the ID generated from InventoryItem nor the Item reference)
 * @param slot The slot where item is located at.
 * @param rotated The actual rotation status of item.
 */
function removeItemOnGrid(grid: (number | null)[], maxWidth: number, { width, height }: Readonly<Item>, item: number = -1, slot: number = 0, rotated: boolean = false): void {
    const itemHeight: number = rotated ? width : height;
    const itemWidth: number = rotated ? height : width;
    const maxItemWidth: number = itemWidth + slot;
    const maxItemHeight: number = itemHeight * maxWidth + slot;

    // Remove the current item from the grid
    for (let slotX = slot; slotX < maxItemWidth; slotX++) // Loop through horizontally
        for (let slotY = slotX; slotY < maxItemHeight; slotY += maxWidth) // Loop through vertically
            if (grid[slotY] === item)
                grid[slotY] = null;
}

/**
 * Check if is possible to place the item to the grid provided.
 * @param grid The grid generated related to the block.
 * @param maxWidth The max width of the grid provided.
 * @param width The item width.
 * @param height The item height.
 * @param itemData
 * @param item The item index obtained from InventoryItemIndexes. (Not the ID generated from InventoryItem nor the Item reference)
 * @param slot The slot where item will be placed.
 * @param rotated The actual rotation status of item.
 * @param override Should override the original grid to place the actual item on it?
 *
 * @return The possibility of placing the item on the grid provided.
 */
function canPlaceItemOnGrid(grid: (number | null)[], maxWidth: number, { width, height, ...itemData }: Readonly<Item>, item: number = -1, slot: number = 0, rotated: boolean = false, override: boolean = false): boolean {
    const maxHeight: number = grid.length / maxWidth;
    const itemWidth: number = rotated ? height : width;
    const itemHeight: number = rotated ? width : height;
    const maxItemWidth: number = itemWidth + slot;
    const maxItemHeight: number = itemHeight * maxWidth + slot;

    // Check if the item sizes aren't out of grid bounds
    if (
        itemWidth > maxWidth || itemHeight > maxHeight || // Check the sizes of item if are bigger than the grid
        slot % maxWidth + itemWidth > maxWidth || // Check the width from that slot if is not out of bounds in order of width
        (~~((slot + maxWidth) / maxWidth) - 1) + itemHeight > maxHeight // // Check the height from that slot if is not out of bounds in order of height
    )
        return false;

    // Check if there's an item on the grids to place and not from itself
    for (let slotX = slot; slotX < maxItemWidth; slotX++) // Loop through horizontally
        for (let slotY = slotX; slotY < maxItemHeight; slotY += maxWidth) // Loop through vertically
            if (grid[slotY] !== null && grid[slotY] !== item)
                return false; // Item cannot be placed because there is already another item in the grid cell

    if (override && item > -1)
        insertItemOnGrid(grid, maxWidth, { width, height, ...itemData }, item, slot, rotated);

    return true; // Item can be placed on the grid
}

/**
 * Check if is possible to swap the "item to slot"/"slot to item" from the indexes provided. Both arguments should be
 * different types (Like, from InventoryBlockIndexes to InventoryItemIndexes, or, from InventoryItemIndexes to InventoryBlockIndexes)
 * otherwise, will always return false.
 * - From InventoryBlockIndexes | To InventoryItemIndexes = Swapping from "slot" to "grid"
 * - From InventoryItemIndexes | To InventoryBlockIndexes = Swapping from "grid" to "slot"
 * @param from The item to be moved or swapped with to.
 * @param to The index where to be placed.
 * @param type Optional and only be should specify the type if the argument "to" is of type "InventoryBlockIndexes",
 * to check if item which is being dragged to this slot should verify both of types.
 * @param slot Specific the slot if argument "to" is of type "InventoryItemIndexes"
 * @param rotated Specific the rotation status if argument "to" is of type "InventoryItemIndexes"
 *
 * @return The possibility of putting or swapping.
 */
function canSwapSlot(from: Readonly<InventoryBlockIndexes | InventoryItemIndexes>, to: Readonly<InventoryBlockIndexes | InventoryItemIndexes>, type: ClothingType | WeaponType | null = null, slot: number = 0, rotated: boolean = false): boolean {
    // Check if it is swapping from "slot" to "grid"
    if (!isInventoryItemDragData(from) && isInventoryItemDragData(to)) {
        const fromIB: Readonly<InventoryBlock> = getInventoryBlockByIndexes(from);

        if (fromIB.items.length > 0 || from.inventory === to.inventory && from.block === to.block) return false;

        // Create a copy of the grid to simulate item placement
        const [toGridCopy, toMaxWidth]: GridData = generateGrid(to);
        const fromI: Readonly<Item> = getItemById(fromIB.item);

        return to.item === -1 && toGridCopy[slot] === null && canPlaceItemOnGrid(toGridCopy, toMaxWidth, fromI, to.item, slot, rotated);
    } else if (isInventoryItemDragData(from) && !isInventoryItemDragData(to)) { // Otherwise, is swapping from "grid" to "slot"
        const fromII: Readonly<InventoryItem> = getInventoryItemByIndexes(from);
        const fromI: Readonly<Item> = getItemById(fromII.item);

        return to.block < 0 && fromI.type === type;
    } else return false;
}

/**
 * Check if is possible to swap the item to indexes provided.
 * @param from The item to be moved or swapped with to.
 * @param to The index where to be placed.
 * @param slot Specific the slot so the "from" object can have updated data.
 * @param rotated Specific the rotation status so the "from" object can have updated data.
 *
 * @return The possibility of putting or swapping.
 */
function canSwapItem(from: Readonly<InventoryItemIndexes>, to: Readonly<InventoryItemIndexes>, slot: number = 0, rotated: boolean = false): boolean {
    const fromII: Readonly<InventoryItem> = getInventoryItemByIndexes(from);
    const fromI: Readonly<Item> = getItemById(fromII.item);

    // Check if the item is still in same slot
    if (deepEqual(from, to) && fromII.rotated === rotated) return false;

    // Create a copy of the grid to simulate item placement
    const [toGridCopy, toMaxWidth]: GridData = generateGrid(to, new Set([ from.item ]));

    // Check if exists any item on that slot, if there's no item, is just a "move"
    if (to.item === -1 && toGridCopy[slot] === null)
        return canPlaceItemOnGrid(toGridCopy, toMaxWidth, fromI, from.item, slot, rotated);

    const toII: Readonly<InventoryItem> = getInventoryItemByIndexes(to);
    const toI: Readonly<Item> = getItemById(toII.item);

    // Remove the item on actual slot from the grid
    removeItemOnGrid(toGridCopy, toMaxWidth, toI, to.item, toII.slot, toII.rotated);

    if (from.block === to.block) { // Check if we are swapping in same "block".
        return canPlaceItemOnGrid(toGridCopy, toMaxWidth, fromI, from.item, toII.slot, rotated, true) && canPlaceItemOnGrid(toGridCopy, toMaxWidth, toI, to.item, fromII.slot, toII.rotated);
    } else { // If no these, means we are swapping items from different blocks.
        if (!canPlaceItemOnGrid(toGridCopy, toMaxWidth, fromI, from.item, toII.slot, rotated)) return false;

        // Create a copy of the grid to simulate item placement
        const [fromGridCopy, fromMaxWidth]: GridData = generateGrid(from, new Set([ from.item ]));
        return canPlaceItemOnGrid(fromGridCopy, fromMaxWidth, toI, to.item, fromII.slot, toII.rotated);
    }
}

export {
    getInventoryBlockByIndexes,
    getInventoryItemByIndexes,
    canSwapSlot,
    canSwapItem
};
