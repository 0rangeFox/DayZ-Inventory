<script lang='ts'>
    import type { Item } from '../../lib/models';

    export let item: Readonly<Item>;
</script>

<div class='header'>
    <div class='title'>
        <img src={`/images/inventory/items/${item.image}.png`} draggable='false' />
        {item.name}
    </div>
    <div>X</div>
</div>

<style lang='scss'>
    $backgroundColor: rgba(0, 0, 0, .8);

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: $backgroundColor;
        padding: 2%;
        user-select: none;

        .title {
            width: 90%;
            display: flex;
            align-items: center;

            img {
                width: 10%;
                margin-right: 2%;
            }
        }
    }
</style>