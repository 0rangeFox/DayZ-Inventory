<script lang='ts'>
    import { beforeUpdate } from 'svelte';
    import type { InventoryBlock, InventoryDragData, InventoryIndex, InventorySlotsProps } from '../../../lib/models';
    import type { DragEvent } from '../../../lib/dnd/models';
    import { inventories, updateInventory } from '../../../lib/stores/InventoryStore';
    import { InventorySlotsPropsSchema, InventoryBlockPropsSchema, MAX_SLOT_X } from '../../../lib/models';
    import { serialize } from '../../../lib/utils/JsonUtil';
    import DropTarget from '../../dnd/DropTarget.svelte';
    import Slots from '../InventorySlots.svelte';
    import Block from '../InventoryBlock.svelte';

    export let index: Readonly<InventoryIndex>;

    let slots: InventorySlotsProps[] = [];
    let blocks: ReadonlyArray<InventoryBlock> = [];

    beforeUpdate(() => {
        blocks = $inventories[index.inventory].blocks;
        slots = blocks.map((block, i) => ({ id: block.id, data: { index: { ...index, block: i }, slot: null } }));
    });

    function onDragEnter({ detail: { dragElement } }: CustomEvent<DragEvent<InventoryDragData>>): void {
        dragElement.style.boxShadow = 'inset 0 0 0 1px aqua';
    }

    function onDragLeave({ detail: { dragElement } }: CustomEvent<DragEvent<InventoryDragData>>): void {
        dragElement.style.boxShadow = 'inset 0 0 0 1px red';
    }

    function onDrop({ detail: { data } }: CustomEvent<DragEvent<InventoryDragData>>): void {
        if (!data) return;
        updateInventory(data.index, index, -1, false);
    }
</script>

<span class='root'>
    <DropTarget
        on:dragEnter={onDragEnter}
        on:dragLeave={onDragLeave}
        on:drop={onDrop}
    >
        <section class='container'>
            <div class='slots'>
                <Slots height={Math.ceil(slots.length / MAX_SLOT_X)} data={serialize(InventorySlotsPropsSchema)(slots)} />
            </div>
            <div class='blocks'>
                {#each blocks as block, id (block.id)}
                    <Block data={serialize(InventoryBlockPropsSchema)({ index: { ...index, block: id }, block })} />
                {/each}
            </div>
        </section>
    </DropTarget>
</span>

<style lang='scss'>
    @import '../../../lib/styles/scrollbar';

    .root {
        height: 100%;

        direction: rtl;

        overflow-x: hidden;
        overflow-y: auto;

        .container {
            height: inherit;

            direction: ltr;

            .slots {
                margin-bottom: 5%;
            }

            .blocks {
                :global(.block + .block) {
                    margin-top: 5%;
                }
            }
        }
    }
</style>