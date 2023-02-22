function Generate<T>(event: string, data: T): CustomEvent<T> {
    return new CustomEvent<T>(event, {
        bubbles: true,
        cancelable: true,
        detail: data,
    });
}

function AddListener(
    element: Element,
    keys: string | string[],
    event: string,
    func: EventListener
): void {
    (Array.isArray(keys) ? keys : [keys as string]).forEach((key) =>
        element.addEventListener(`${key}${event}`, func)
    );
}

function RemoveListener(
    element: Element,
    keys: string | string[],
    event: string,
    func: EventListener
): void {
    (Array.isArray(keys) ? keys : [keys as string]).forEach((key) =>
        element.removeEventListener(`${key}${event}`, func)
    );
}

function Dispatch<T>(
    element: Element,
    keys: string | string[],
    event: string,
    data: T
) {
    (Array.isArray(keys) ? keys : [keys as string]).forEach((key) =>
        element.dispatchEvent(
            Generate<T>(`${key}${event}`, { ...data, targetKey: key })
        )
    );
}

export {
    AddListener,
    RemoveListener,
    Dispatch
};
