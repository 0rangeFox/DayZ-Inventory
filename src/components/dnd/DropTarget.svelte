<script lang='ts' context='module'>
    import { v4 } from 'uuid';
    export const UNIQUE_KEY: string = v4();

    function checkTargetKeys(from: any | any[], to: any | any[]): boolean {
        const isFromArray: boolean = Array.isArray(from), isToArray: boolean = Array.isArray(to);
        if (isFromArray && isToArray) {
            return (from as any[]).some((element) => (to as any[]).includes(element));
        } else if (isFromArray) {
            return (from as any[]).includes(to);
        } else if (isToArray) {
            return (to as any[]).includes(from);
        } else {
            return from === to;
        }
    }
</script>

<script lang='ts'>
    import { createEventDispatcher } from 'svelte';
    import type { DragEvent } from '../../lib/dnd/models';

    type TDrag = $$Generic<any>;

    export let targetKey: any | any[] = null;
    export let data: TDrag = {};

    const dispatch = createEventDispatcher();

    // useCallback equivalent of React
    $: (dragEnter = ({ detail }: CustomEvent<DragEvent<TDrag>>): void => {
        if (targetKey && !checkTargetKeys(targetKey, detail.targetKey)) return;
        dispatch<DragEvent<TDrag>>('dragEnter', detail);
    });

    $: (dragLeave = ({ detail }: CustomEvent<DragEvent<TDrag>>): void => {
        if (targetKey && !checkTargetKeys(targetKey, detail.targetKey)) return;
        dispatch<DragEvent<TDrag>>('dragLeave', detail);
    });

    $: (drop = ({ detail }: CustomEvent<DragEvent<TDrag>>): void => {
        if (targetKey && !checkTargetKeys(targetKey, detail.targetKey)) return;
        dispatch<DragEvent<TDrag>>('drop', detail);
    });
</script>

<span
    id={UNIQUE_KEY}
    on:dragEnter={dragEnter}
    on:dragLeave={dragLeave}
    on:drop={drop}
    class='container'
>
    <slot />
</span>

<style lang='scss'>
    .container {
        width: 100%;
        height: 100%;
    }
</style>