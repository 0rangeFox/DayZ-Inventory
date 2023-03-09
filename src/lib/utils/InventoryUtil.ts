import { get } from 'svelte/store';
import { getItemById, inventories } from '../stores/InventoryStore';
import type { Inventory, InventoryBlock, InventoryItem, BlockIndexes, InventoryIndex, InventoryItemIndexes, Item } from '../models';

const enum IndexType {
    INVENTORY,
    BLOCK,
    ITEM
}

function getIndexesById(id: string, type: IndexType.INVENTORY): Readonly<InventoryIndex> | null;
function getIndexesById(id: string, type: IndexType.BLOCK): Readonly<BlockIndexes> | null;
function getIndexesById(id: string, type: IndexType.ITEM): Readonly<InventoryItemIndexes> | null;
function getIndexesById(id: string): Readonly<InventoryItemIndexes> | null;

/**
 *
 * @param id The ID generated and not the item identifier/reference.
 * @param type As default is item, choose one to get just that indexes.
 *
 * @return Will be returned the indexes depending on the sizes.
 */
function getIndexesById(id: string, type: IndexType = IndexType.ITEM): Readonly<InventoryIndex | BlockIndexes | InventoryItemIndexes> | null {
    const rInventories: Readonly<Inventory[]> = get<Readonly<Inventory[]>>(inventories);

    switch (type) {
        case IndexType.BLOCK:
            for (let inventory = 0; inventory < rInventories.length; inventory++)
                for (let block = 0; block < rInventories[inventory].blocks.length; block++)
                    if (rInventories[inventory].blocks[block].id === id)
                        return { inventory, block };
            break;
        case IndexType.ITEM:
            for (let inventory = 0; inventory < rInventories.length; inventory++)
                for (let block = 0; block < rInventories[inventory].blocks.length; block++)
                    for (let slot = 0; slot < rInventories[inventory].blocks[block].items.length; slot++)
                        if (rInventories[inventory].blocks[block].items[slot].id === id)
                            return { inventory, block, slot };
            break;
    }

    return null;
}

/**
 *
 * @param id The ID generated and not the item identifier/reference.
 *
 * @return The Inventory Item model related to that ID has choosen.
 */
function getInventoryItemById(id: string): Readonly<InventoryItem> | null {
    const iii: Readonly<InventoryItemIndexes> | null = getIndexesById(id);
    return iii ? get<Readonly<Inventory[]>>(inventories)[iii.inventory].blocks[iii.block].items[iii.slot] : null;
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

function insertItemOnGrid(grid: (string | null)[], maxWidth: number, { id, item, slot, rotated }: InventoryItem): void {
    const { width, height }: Item = getItemById(item);

    const itemHeight: number = rotated ? width : height;
    const itemWidth: number = rotated ? height : width;
    const maxItemWidth: number = itemWidth + slot;
    const maxItemHeight: number = itemHeight * maxWidth + slot;

    for (let slotX = slot; slotX < maxItemWidth; slotX++) // Loop through horizontally
        for (let slotY = slotX; slotY < maxItemHeight; slotY += maxWidth) // Loop through vertically
            grid[slotY] = id;
}

function removeItemOnGrid(grid: (string | null)[], maxWidth: number, { id, item, slot, rotated }: InventoryItem): void {
    const { width, height }: Item = getItemById(item);

    const itemHeight: number = rotated ? width : height;
    const itemWidth: number = rotated ? height : width;
    const maxItemWidth: number = itemWidth + slot;
    const maxItemHeight: number = itemHeight * maxWidth + slot;

    // Remove the current item from the grid
    for (let slotX = slot; slotX < maxItemWidth; slotX++) // Loop through horizontally
        for (let slotY = slotX; slotY < maxItemHeight; slotY += maxWidth) // Loop through vertically
            if (grid[slotY] === id)
                grid[slotY] = null;
}

function canPlaceItemOnGrid(grid: (string | null)[], maxWidth: number, iItem: InventoryItem, override: boolean = false): boolean {
    const { id, item, slot, rotated } = iItem;
    const { width, height }: Item = getItemById(item);

    const maxHeight: number = grid.length / maxWidth;
    const itemHeight: number = rotated ? width : height;
    const itemWidth: number = rotated ? height : width;
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
            if (grid[slotY] && grid[slotY] !== id)
                return false; // Item cannot be placed because there is already another item in the grid cell

    if (override)
        insertItemOnGrid(grid, maxWidth, iItem);

    return true; // Item can be placed on the grid
}

/**
 * Generate the grid in array.
 * @param item The ID of item to get the width and height.
 * @param items To populate the grid with the items as default.
 * @param ignore Insert the ID unique of items to not be placed on the grid generated.
 *
 * @return The grid built in array with items built in.
 */
function generateGrid(item: number, items: readonly InventoryItem[], ignore?: Set<string>): (string | null)[] {
    const { freeWidth, freeHeight }: Item = getItemById(item);
    const blockGridItems: (string | null)[] = generateEmptyGrid(freeWidth, freeHeight);
    const filteredItems = ignore ? items.filter(({ id }: InventoryItem) => !ignore.has(id)) : items;

    for (let i = 0; i < filteredItems.length; i++) {
        const item: Readonly<InventoryItem> = filteredItems[i];
        insertItemOnGrid(blockGridItems, freeWidth, item);
    }

    return blockGridItems;
}

/**
 * Check if is possible to swap the item to indexes provided.
 * @param from The item with state updated. (State updated for like, rotation)
 * @param to The indexes to tell where to place the item.
 *
 * @return The possibility of putting or swapping.
 */
function canSwapItem(from: Readonly<InventoryItem>, to: Readonly<InventoryItemIndexes>): boolean {
    const inventory: Readonly<Inventory[]> = get<Readonly<Inventory[]>>(inventories);

    const fromIndexes: Readonly<InventoryItemIndexes> = getIndexesById(from.id)!;
    const fromOriginal: Readonly<InventoryItem> = inventory[fromIndexes.inventory].blocks[fromIndexes.block].items[fromIndexes.slot];

    const { item, items }: Readonly<InventoryBlock> = inventory[to.inventory].blocks[to.block];
    const { freeWidth }: Readonly<Item> = getItemById(item);

    // Create a copy of the grid to simulate item placement
    const toGridCopy: (string | null)[] = generateGrid(item, items, new Set([ fromOriginal.id ]));

    // Check if exists any item on that slot, if there's no item, is just a "move"
    if (!toGridCopy[to.slot])
        return canPlaceItemOnGrid(toGridCopy, freeWidth, { ...from, slot: to.slot });

    const toII: Readonly<InventoryItem> = getInventoryItemById(toGridCopy[to.slot]!)!;
    // Remove the item on actual slot from the grid
    removeItemOnGrid(toGridCopy, freeWidth, toII);

    if (fromIndexes.block === to.block) { // Check if we are swapping in same "block".
        return canPlaceItemOnGrid(toGridCopy, freeWidth, { ...from, slot: toII.slot }, true) && canPlaceItemOnGrid(toGridCopy, freeWidth, { ...toII, slot: from.slot });
    } else { // If no these, means we are swapping items from different blocks.
        if (!canPlaceItemOnGrid(toGridCopy, freeWidth, { ...from, slot: toII.slot })) return false;

        const { item, items }: Readonly<InventoryBlock> = inventory[fromIndexes.inventory].blocks[fromIndexes.block];
        const { freeWidth: fromFreeWidth }: Readonly<Item> = getItemById(item);

        // Create a copy of the grid to simulate item placement
        const fromGridCopy: (string | null)[] = generateGrid(item, items, new Set([ fromOriginal.id ]));
        return canPlaceItemOnGrid(fromGridCopy, fromFreeWidth, { ...toII, slot: from.slot });
    }
}

export {
    IndexType,
    getIndexesById,
    generateGrid,
    canSwapItem
};
