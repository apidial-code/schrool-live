type noop = (...args: any[]) => any;
/**
 * usePersistFn instead of useCallback to reduce cognitive load
 */
export declare function usePersistFn<T extends noop>(fn: T): T;
export {};
