<script lang='ts'>
    import { innerDimensions } from '../../lib/utils/GraphicUtil';
    import InventorySlot from './InventorySlot.svelte';

    export let width: number = 0;
    export let height: number = 0;

    let containerElement: HTMLDivElement;
    let size: number = 0;

    $: size = innerDimensions(containerElement).width;
</script>

<div
    bind:this={containerElement}
    bind:clientWidth={size}
    class='container'
>
    <div
        class='grid'
        style='--size: {size}; --width: {width}; --height: {height};'
    >
        <InventorySlot id={0} hasItem width={4} height={2} />
        {#each Array(width * height - 1) as _, i}
            <InventorySlot id={i + 1} />
        {/each}
    </div>
</div>

<style lang='scss'>
    @import '../../variables.module.scss';

    .container {
        background-color: rgba(23, 23, 23, .85);
        backdrop-filter: blur(2px);
        padding-right: 5%;

        .grid {
            $size: calc(var(--size) / $MAX_GRID_X * 1px);
            $width: var(--width);
            $height: var(--height);
            $border: 1px solid rgba(111, 111, 111, .4);

            width: calc($width * $size + 1px);
            height: calc($height * $size + 1px);

            display: grid;
            grid-template: repeat($height, $size) / repeat($width, $size);

            border-top: $border;
            border-left: $border;

            :global(.slot) {
                border-right: $border;
                border-bottom: $border;
            }
        }
    }
</style>