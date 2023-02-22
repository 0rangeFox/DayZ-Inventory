<script lang='ts'>
    import DragDropContainer from "../dnd/DragDropContainer.svelte";

    export let width: number = 0;
    export let height: number = 0;

    export let hasItem: boolean = false;
</script>

<div class='slot'>
    {#if hasItem}
        <DragDropContainer>
            <div
                    class='item'
                    style='--width: {width}; --height: {height};'
            >
                <div class="img" style='--img: url("https://static.wikia.nocookie.net/dayz_gamepedia/images/6/6c/AKM.png");' />
            </div>
        </DragDropContainer>
    {/if}
</div>

<style lang='scss'>
    .slot {
      //display: flex;
      //justify-content: center;
      //align-items: center;
      //user-select: none;

        .item {
            $size: calc(var(--size) * 1px);
            $width: var(--width);
            $height: var(--height);

            width: calc($width * $size);
            height: calc($height * $size);
            position: relative;
            background-color: rgba(80, 80, 80, 0.6);

            .img {
                height: 100%;
                box-sizing: border-box;
                background-origin: content-box;
                background-image: var(--img);
                background-size: contain;
                background-position: center;
                background-repeat: no-repeat;
                padding: 5px;
            }
        }
    }
</style>