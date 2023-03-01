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
    import type { DragData } from '../../lib/dnd/models';

    type TDrag = $$Generic<any>;

    export let targetKey: any | any[] = null;
    export let data: TDrag = {};

    const dispatch = createEventDispatcher();

    // useCallback equivalent of React
    $: (dragEnter = ({ detail: { targetKey: eTargetKey, data }}: CustomEvent<DragData<TDrag>>): void => {
        if (targetKey && !checkTargetKeys(targetKey, eTargetKey)) return;

        console.log(`DropTarget | DragEnter`, data);
        dispatch('dragEnter', data);
    });

    $: (dragLeave = ({ detail: { targetKey: eTargetKey, data }}: CustomEvent<DragData<TDrag>>): void => {
        if (targetKey && !checkTargetKeys(targetKey, eTargetKey)) return;

        console.log(`DropTarget | DragLeave`, data);
        dispatch('dragLeave', data);
    });

    $: (drop = ({ detail: { targetKey: eTargetKey, data }}: CustomEvent<DragData<TDrag>>): void => {
        if (targetKey && !checkTargetKeys(targetKey, eTargetKey)) return;

        console.log(`DropTarget | Drop`, data);
        dispatch('drop', data);
    });
</script>

<span
    id={UNIQUE_KEY}
    on:dragEnter={dragEnter}
    on:dragLeave={dragLeave}
    on:drop={drop}
>
    <slot />
</span>