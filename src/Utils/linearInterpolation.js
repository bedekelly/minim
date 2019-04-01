/**
 * Linearly map a value from one range to another.
 */
function linMap(value, fromLower, fromUpper, toLower, toUpper) {
    const lowerRange = fromUpper - fromLower;
    const upperRange = toUpper - toLower;
    const magnitudeThroughLowerRange = (value - fromLower);
    const fractionThroughRange = magnitudeThroughLowerRange / lowerRange;
    const magnitudeThroughUpperRange = fractionThroughRange * upperRange;
    return toLower + magnitudeThroughUpperRange;
}


/**
 * Clamp a value to the range lower <= value <= upper.
 */
function bounded(value, lower, upper) {
    if (value > upper) return upper;
    if (value < lower) return lower;
    return value;
}


/**
 * Linearly map a value from one range to another, then clamp the
 * result to the second range.
 */
function boundedLinMap(value, fromLower, fromUpper, toLower, toUpper) {
    const newValue = linMap(value, fromLower, fromUpper, toLower, toUpper);
    return bounded(newValue, toLower, toUpper);
}


export { linMap, bounded, boundedLinMap };