function benchmark(name: string, test: () => void): void {
    const startTime: DOMHighResTimeStamp = performance.now();
    test();
    const endTime: DOMHighResTimeStamp = performance.now();
    console.log(`${name} | Elapsed ${startTime - endTime}ms`)
}

export { benchmark };
