<script lang='ts'>
    import '$lib/styles/styles.scss';

    import Inventory from '../components/inventory/Inventory.svelte';
</script>

<div
    style='
        z-index: -1;
        position: absolute;
        min-width: 100vw;
        min-height: 100vh;
        user-select: none;
        background-size: cover;
        background-image: url("/images/background.png");
    '
/>

<span class='inventory'>
    <Inventory />
</span>

<style lang='scss'>
    .inventory {
        width: 100vw;
        height: 100vh;

        position: absolute;
    }
</style>