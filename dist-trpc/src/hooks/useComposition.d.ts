export interface UseCompositionReturn<T extends HTMLInputElement | HTMLTextAreaElement> {
    onCompositionStart: React.CompositionEventHandler<T>;
    onCompositionEnd: React.CompositionEventHandler<T>;
    onKeyDown: React.KeyboardEventHandler<T>;
    isComposing: () => boolean;
}
export interface UseCompositionOptions<T extends HTMLInputElement | HTMLTextAreaElement> {
    onKeyDown?: React.KeyboardEventHandler<T>;
    onCompositionStart?: React.CompositionEventHandler<T>;
    onCompositionEnd?: React.CompositionEventHandler<T>;
}
export declare function useComposition<T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement>(options?: UseCompositionOptions<T>): UseCompositionReturn<T>;
