/**
 * Filters out undefined values from the first level of an object.
 * Preserves all other falsy values (null, false, 0, empty string).
 *
 * @param obj - The object to filter, or any other value
 */
export declare function filterUndefinedValues<T>(obj: T): T;
