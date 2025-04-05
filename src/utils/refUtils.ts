// src/utils/refUtils.ts
export function mergeRefs<T = any>(...refs: Array<React.MutableRefObject<T> | React.LegacyRef<T> | null>) {
    return (value: T): void => {
        refs.forEach(ref => {
            if (typeof ref === 'function') {
                ref(value);
            } else if (ref != null) {
                (ref as React.MutableRefObject<T | null>).current = value;
            }
        });
    };
}