<script lang='ts'>
    import '../styles.scss';

    import { inventories } from '../lib/stores/InventoryStore';
    import Inventory from '../components/inventory/Inventory.svelte';
    import { serialize } from '../lib/utils/JsonUtil';
    import { InventoryPropsSchema } from '../lib/models';
</script>

<div
    style='
        z-index: -1;
        position: absolute;
        min-width: 100vw;
        min-height: 100vh;
        user-select: none;
        background-size: cover;
        background-image: url("https://media.discordapp.net/attachments/926185998466027570/1084086677817012314/image.png");
    '
/>

<div class='inventories'>
    {#each $inventories as { type, blocks }, inventory (type)}
        <Inventory {type} data={serialize(InventoryPropsSchema)({ index: { inventory }, blocks })} />
    {/each}
</div>

<style lang='scss'>
    .inventories {
        position: absolute;
        width: 100vw;
        height: 100vh;

        display: flex;
        justify-content: space-between;

        padding: 2%;
        box-sizing: border-box;

        :global(> :nth-child(even)) {
            align-self: flex-end;
        }
    }
</style>