<script lang='ts'>
    export let size: number = 50;
    export let width: number = 0;
    export let height: number = 0;
</script>

<div class='container'>
    <div
        class='grid'
        style='--size: {size}; --width: {width}; --height: {height};'
    >
        <slot />
    </div>
</div>

<style lang='scss'>
    .container {
      width: 100%;
      background-color: rgba(23, 23, 23, .6);
      backdrop-filter: blur(2px);
    }

    .grid {
        $size: calc(var(--size) * 1px);
        $width: var(--width);
        $height: var(--height);
        $border: 1px solid rgba(111, 111, 111, .6);

        width: calc($width * $size);
        height: calc($height * $size);
        display: grid;
        grid-template: repeat($height, $size) / repeat($width, $size);

        border-top: $border;
        border-left: $border;

        :global(.slot) {
            border-bottom: $border;
            border-right: $border;

            :global(.item::before) {
                --size: $size;
            }
        }
    }
</style>