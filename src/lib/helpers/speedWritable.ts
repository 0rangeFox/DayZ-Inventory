import type { StartStopNotifier, Subscriber, Unsubscriber, Updater } from 'svelte/store';
import { writable } from 'svelte/store';

type SpeedWritable<T> = [
    {
        subscribe: (this: void, run: Subscriber<T>, invalidate?: (value?: T) => void) => Unsubscriber
    },
    (this: void, value: T) => void,
    (this: void, updater: Updater<T>) => void
]

/**
 * Create a Writable store that allows both updating and reading by subscription.
 * @param value Initial value
 * @param start Start and stop notifications for subscriptions
 * @return First element is a subscriber object, second is a setter function and then the last is an updater function
 * @example
 * <script lang='ts'>
 *   const [ isLoading, setLoadingStatus, updateLoadingStatus ] = speedWritable<boolean>(false);
 *
 *   function onChangeLoadingStatusClick(): void {
 *       updateLoadingStatus((oldLoadingStatus) => !oldLoadingStatus);
 *   }
 * </script>
 *
 * <button on:click={onChangeLoadingStatusClick}>Change loading status</button>
 * <RedLoading isOpen={$isLoading} />
 */
function speedWritable<T>(value?: T, start?: StartStopNotifier<T>): SpeedWritable<T> {
    const { subscribe, set, update } = writable<T>(value, start);
    return [ { subscribe }, set, update ];
}

export default speedWritable;
export type { SpeedWritable };
