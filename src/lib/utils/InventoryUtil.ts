import moize from 'moize';
import { getItemById } from '../stores/InventoryStore';
import type InventoryBlock from '../models/InventoryBlock';
import type { InventoryItem, Item } from '../models/InventoryItem';

const generateEmptyGrid = moize((width: number, height: number): null[] => new Array<null>(width * height).fill(null));

function insertItemOnGrid(maxWidth: number, grid: (string | null)[], { id, item, slot, rotated }: InventoryItem): void {
    const { width, height }: Item = getItemById(item);

    const itemHeight: number = rotated ? width : height;
    const itemWidth: number = rotated ? height : width;
    const maxItemWidth: number = itemWidth + slot;
    const maxItemHeight: number = itemHeight * maxWidth + slot;

    for (let slotX = slot; slotX < maxItemWidth; slotX++) // Loop through horizontally
        for (let slotY = slotX; slotY < maxItemHeight; slotY += maxWidth) // Loop through vertically
            grid[slotY] = id;
}

function generateGridFromBlock(block: InventoryBlock, ignore: string[] = []): (string | null)[] {
    const { freeWidth, freeHeight }: Item = getItemById(block.item);
    const blockGridItems: (string | null)[] = generateEmptyGrid(freeWidth, freeHeight);

    for (const item of block.items.filter(({ id }: InventoryItem) => !ignore.includes(id)))
        insertItemOnGrid(freeWidth, blockGridItems, item);

    return blockGridItems;
}

export {
    generateGridFromBlock
};
