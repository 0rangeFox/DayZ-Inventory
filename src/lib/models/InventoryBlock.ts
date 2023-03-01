import type { InventoryItem } from '.';
import { MAX_GRID_X, MAX_GRID_Y } from '../../variables.module.scss';

interface InventoryBlock {
    // Identifier
    id: string;

    // Information
    item: number;

    // Items stored
    items: InventoryItem[];
}

export default InventoryBlock;
export { MAX_GRID_X, MAX_GRID_Y };
