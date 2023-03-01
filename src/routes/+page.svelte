<script lang='ts'>
    import '../styles.scss';

    import { inventories } from '../lib/stores/InventoryStore';
    import InventoryBlock from '../components/inventory/InventoryBlock.svelte';
</script>

<div
    style='
        z-index: -1;
        position: absolute;
        min-width: 100vw;
        min-height: 100vh;
        user-select: none;
        background-size: cover;
        background-image: url("https://www.dayzrp.com/uploads/monthly_2018_11/DlQvdTqW4AInjYs.jpg.d5a9ca254a5a5610c486778973dd03f5.jpg");
    '
/>

{#each $inventories as inventory}
    <section class='inventory'>
        {#each inventory.blocks as block}
            <InventoryBlock {block} />
        {/each}
    </section>
{/each}

<style lang='scss'>
    .inventory {
        width: 60%;
        max-height: 90%;

        overflow-y: scroll;

        :global(.block + .block) {
            margin-top: 5%;
        }
    }

    /* Width */
    ::-webkit-scrollbar {
        width: 5px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px grey;
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, .3);
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, .6);
    }
</style>