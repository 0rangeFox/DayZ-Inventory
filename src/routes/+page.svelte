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
        background-image: url("https://media.discordapp.net/attachments/926185998466027570/1084086677817012314/image.png");
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