import { get } from 'svelte/store';
import { getItemById, inventories } from '../stores/InventoryStore';
import type { Inventory, InventoryBlock, InventoryItem, InventoryItemIndexes, Item } from '../models';

function getInventoryItemById(id: string): InventoryItem | null {
    const iii: InventoryItemIndexes | null = getIndexesById(id);
    return iii ? get<Inventory[]>(inventories)[iii.inventory].blocks[iii.block].items[iii.slot] : null;
}

function getIndexesById(id: string): InventoryItemIndexes | null {
    const invs: Inventory[] = get<Inventory[]>(inventories);
    for (let inventory = 0; inventory < invs.length; inventory++)
        for (let block = 0; block < invs[inventory].blocks.length; block++)
            for (let slot = 0; slot < invs[inventory].blocks[block].items.length; slot++)
                if (invs[inventory].blocks[block].items[slot].id === id)
                    return { inventory, block, slot };
    return null;
}

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

function canPlaceItemOnGrid(grid: (string | null)[], maxWidth: number, { id, item, slot, rotated }: InventoryItem): boolean {
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
    return true; // Item can be placed on the grid
}

function generateGridFromBlock(block: InventoryBlock): (string | null)[] {
    const { freeWidth, freeHeight }: Item = getItemById(block.item);
    const blockGridItems: (string | null)[] = generateEmptyGrid(freeWidth, freeHeight);

    for (const item of block.items)
        insertItemOnGrid(blockGridItems, freeWidth, item);

    return blockGridItems;
}

function canSwapItemOnGrid(grid: (string | null)[], maxWidth: number, from: InventoryItem, to?: InventoryItem | null): boolean {
    const fromItem: Item = getItemById(from.item);
    const toItem: Item | null = to ? getItemById(to.item) : null;

    if ( // Check if both of items are in same rotation and sizes.
        from.rotated === to?.rotated && fromItem.width === toItem?.width && fromItem.height === toItem?.height ||
        // Check if both of items are in different rotation but same sizes.
        from.rotated !== to?.rotated && fromItem.width === toItem?.height && fromItem.height === toItem?.width
    ) {
        return true;
    } else if (to && toItem) { // Means to swap between the items
        // Create a copy of the grid to simulate item placement
        const gridCopy: (string | null)[] = [ ...grid ];

        // Remove the current item from the grid
        removeItemOnGrid(gridCopy, maxWidth, { ...to, slot: from.slot });
        if (!canPlaceItemOnGrid(gridCopy, maxWidth, from)) return false;

        const originalFrom: InventoryItem | null = getInventoryItemById(from.id);
        if (!originalFrom) return false;

        removeItemOnGrid(gridCopy, maxWidth, originalFrom);
        return canPlaceItemOnGrid(gridCopy, maxWidth, to);
    } else // Means only put on grid
        return canPlaceItemOnGrid(grid, maxWidth, from);
}

export {
    generateGridFromBlock,
    canSwapItemOnGrid
};
