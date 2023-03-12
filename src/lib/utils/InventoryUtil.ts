import { get } from 'svelte/store';
import type { Inventory, InventoryBlock, InventoryBlockIndexes, InventoryItem, InventoryItemIndexes, Item } from '../models';
import { getItemById, inventories } from '../stores/InventoryStore';
import { deepEqual } from 'fast-equals';

/**
 * Get the inventory block object by the indexes.
 * @param indexes Provide the indexes to get the specific block.
 *
 * @return The inventory block object.
 */
function getInventoryBlockByIndexes(indexes: Readonly<InventoryBlockIndexes>): Readonly<InventoryBlock> {
    return get<Readonly<Inventory[]>>(inventories)[indexes.inventory].blocks[indexes.block];
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
 * @param width The maximum width
 * @param height The maximum height
 *
 * @return Array with limited length corresponding to the limits defined
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
function generateGrid(block: Readonly<InventoryBlockIndexes>, ignore?: ReadonlySet<number>): [(number | null)[], number] {
    const { item, items }: Readonly<InventoryBlock> = getInventoryBlockByIndexes(block);
    const { freeWidth, freeHeight }: Readonly<Item> = getItemById(item);
    const blockGridItems: (number | null)[] = generateEmptyGrid(freeWidth, freeHeight);

    // Convert the items into indexes
    const itemsIndexes: Readonly<number[]> = items.map((_, i) => i);
    const filteredItems: Readonly<number[]> = ignore ? itemsIndexes.filter((i) => !ignore.has(i)) : itemsIndexes;

    for (let i = 0; i < filteredItems.length; i++) {
        const item: Readonly<number> = filteredItems[i];
        const { slot, rotated }: Readonly<InventoryItem> = items[item];
        insertItemOnGrid(blockGridItems, freeWidth, { ...block, item }, slot, rotated);
    }

    return [blockGridItems, freeWidth];
}

function insertItemOnGrid(grid: (number | null)[], maxWidth: number, indexes: Readonly<InventoryItemIndexes>, slot: number = 0, rotated: boolean = false): void {
    const { item }: Readonly<InventoryItem> = getInventoryItemByIndexes(indexes);
    const { width, height }: Readonly<Item> = getItemById(item);

    const itemHeight: number = rotated ? width : height;
    const itemWidth: number = rotated ? height : width;
    const maxItemWidth: number = itemWidth + slot;
    const maxItemHeight: number = itemHeight * maxWidth + slot;

    for (let slotX = slot; slotX < maxItemWidth; slotX++) // Loop through horizontally
        for (let slotY = slotX; slotY < maxItemHeight; slotY += maxWidth) // Loop through vertically
            grid[slotY] = indexes.item;
}

function removeItemOnGrid(grid: (number | null)[], maxWidth: number, indexes: Readonly<InventoryItemIndexes>): void {
    const { item, slot, rotated }: Readonly<InventoryItem> = getInventoryItemByIndexes(indexes);
    const { width, height }: Item = getItemById(item);

    const itemHeight: number = rotated ? width : height;
    const itemWidth: number = rotated ? height : width;
    const maxItemWidth: number = itemWidth + slot;
    const maxItemHeight: number = itemHeight * maxWidth + slot;

    // Remove the current item from the grid
    for (let slotX = slot; slotX < maxItemWidth; slotX++) // Loop through horizontally
        for (let slotY = slotX; slotY < maxItemHeight; slotY += maxWidth) // Loop through vertically
            if (grid[slotY] === indexes.item)
                grid[slotY] = null;
}

function canPlaceItemOnGrid(grid: (number | null)[], maxWidth: number, indexes: Readonly<InventoryItemIndexes>, slot: number = 0, rotated: boolean = false, override: boolean = false): boolean {
    const { item }: Readonly<InventoryItem> = getInventoryItemByIndexes(indexes);
    const { width, height }: Readonly<Item> = getItemById(item);

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
            if (grid[slotY] && grid[slotY] !== indexes.item)
                return false; // Item cannot be placed because there is already another item in the grid cell

    if (override)
        insertItemOnGrid(grid, maxWidth, indexes, slot, rotated);

    return true; // Item can be placed on the grid
}

/**
 * Check if is possible to swap the item to indexes provided.
 * @param from The item to be moved or swapped with to.
 * @param to The index where to be placed.
 * @param slot Specific the slot so the "from" object can have updated data.
 * @param rotated Specific the rotated status so the "from" object can have updated data.
 *
 * @return The possibility of putting or swapping.
 */
function canSwapItem(from: Readonly<InventoryItemIndexes>, to: Readonly<InventoryItemIndexes>, slot: number = 0, rotated: boolean = false): boolean {
    const fromII: Readonly<InventoryItem> = getInventoryItemByIndexes(from);

    // Check if the item is still in same slot
    if (deepEqual(from, to) && fromII.rotated === rotated) return false;

    // Create a copy of the grid to simulate item placement
    const [toGridCopy, toMaxWidth]: [(number | null)[], number] = generateGrid(to, new Set([ from.item ]));

    // Check if exists any item on that slot, if there's no item, is just a "move"
    if (to.item === -1 && toGridCopy[slot] === null)
        return canPlaceItemOnGrid(toGridCopy, toMaxWidth, from, slot, rotated);

    // Remove the item on actual slot from the grid
    removeItemOnGrid(toGridCopy, toMaxWidth, to);
    const toII: Readonly<InventoryItem> = getInventoryItemByIndexes(to);

    if (from.block === to.block) { // Check if we are swapping in same "block".
        return canPlaceItemOnGrid(toGridCopy, toMaxWidth, from, toII.slot, rotated, true) && canPlaceItemOnGrid(toGridCopy, toMaxWidth, to, fromII.slot, toII.rotated);
    } else { // If no these, means we are swapping items from different blocks.
        if (!canPlaceItemOnGrid(toGridCopy, toMaxWidth, from, toII.slot, rotated)) return false;

        // Create a copy of the grid to simulate item placement
        const [fromGridCopy, fromMaxWidth]: [(number | null)[], number] = generateGrid(from, new Set([ from.item ]));
        return canPlaceItemOnGrid(fromGridCopy, fromMaxWidth, to, fromII.slot, toII.rotated);
    }
}

export {
    getInventoryBlockByIndexes,
    getInventoryItemByIndexes,
    canSwapItem
};
