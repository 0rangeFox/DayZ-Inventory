<script lang='ts'>
    import DragDropContainer from '../dnd/DragDropContainer.svelte';
    import DropTarget from "../dnd/DropTarget.svelte";

    export let id: number;
    export let width: number = 0;
    export let height: number = 0;

    export let hasItem: boolean = false;

    function onDragEnter() {

    }

    function onDrag(e) {
        //console.log('Test', e)
    }
</script>

<DropTarget {id} let:dragEnter let:dragLeave let:drop>
    <div
        on:dragEnter={dragEnter}
        on:dragLeave={dragLeave}
        on:drop={drop}
        class='slot'
        data-slot={id}
    >
        {#if hasItem}
            <DragDropContainer
                on:drag={onDrag}
            >
                <div
                    class='item'
                    style='--width: {width}; --height: {height};'
                >
                    <div class='img' style='--img: url("https://static.wikia.nocookie.net/dayz_gamepedia/images/6/6c/AKM.png");'></div>
                </div>
            </DragDropContainer>
        {/if}
    </div>
</DropTarget>

<style lang='scss'>
    .slot {
        width: 100%;
        height: 100%;
    }

    .item {
        width: calc(100% * var(--width));
        height: calc(100% * var(--height));

        background-color: rgba(80, 80, 80, 0.6);

        .img {
            height: 100%;

            box-sizing: border-box;

            background-image: var(--img);
            background-position: center;
            background-size: contain;
            background-repeat: no-repeat;
            background-origin: content-box;

            padding: 5%;
        }
    }
</style>