<script lang='ts'>
    import InventoryGrid from '../components/inventory/InventoryGrid.svelte';
    import InventorySlot from '../components/inventory/InventorySlot.svelte';
    import InventoryHeader from '../components/inventory/InventoryHeader.svelte';

    const inventory_width_size: number = 5;
    const inventory_height_size: number = 2;
</script>

<div
    style='
        z-index: -1;
        position: absolute;
        min-width: 100vw;
        min-height: 100vh;
        user-select: none;
        background-size: cover;
        background-image: url("https://i.ytimg.com/vi/UJxnN1zPzY4/maxresdefault.jpg");
    '
/>

<div class='test'>
    <InventoryHeader image='https://static.wikia.nocookie.net/dayz_gamepedia/images/2/2d/CoyoteBackpack_Brown.png' title='Coyote Backpack (Olive)' />
    <InventoryGrid width={inventory_width_size} height={inventory_height_size}>
        <InventorySlot width={4} height={2} hasItem />
        <InventorySlot />
        <InventorySlot />
        <InventorySlot />
        <InventorySlot />
        <InventorySlot />
        <InventorySlot />
        <InventorySlot />
        <InventorySlot />
    </InventoryGrid>
</div>

<style>
    :global(body) {
        color: white;
        font-family: FontMedium, sans-serif;
        font-size: 15px;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }

    main {
        position: absolute;
        width: 100vw;
        height: 100vh;
    }

    .test {
        width: 500px;
    }
</style>