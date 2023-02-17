<script lang='ts'>
    export let image: string;
    export let title: string;
</script>

<div class='header'>
    <div class='title'>
        <img src={image} />
        {title}
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

        .title {
            width: 100%;
            display: flex;
            align-items: center;

            img {
              width: 25px;
              margin-right: 2%;
            }
        }
    }
</style>