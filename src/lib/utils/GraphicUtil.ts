function innerDimensions(node?: HTMLElement): { width: number, height: number } {
    if (!node) return { width: 0, height: 0 };

    const cs: CSSStyleDeclaration = getComputedStyle(node);

    let width: number = node.clientWidth; // Width with padding
    let height: number = node.clientHeight; // Height with padding

    // Exclude the padding sizes
    width -= parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    height -= parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);

    return { width, height };
}

export {
    innerDimensions
};
