import { useState, useEffect, useRef, DependencyList } from 'react';

export function useTextOverflow<T extends DependencyList>(dependencies?: T) {
    const [hasEnoughSpace, setHasEnoughSpace] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkTextFit = () => {
            if (contentRef.current && containerRef.current) {
                const contentWidth = contentRef.current.scrollWidth;
                const containerWidth = containerRef.current.clientWidth;
                setHasEnoughSpace(containerWidth >= contentWidth);
            }
        };

        checkTextFit();
        window.addEventListener('resize', checkTextFit);
        return () => window.removeEventListener('resize', checkTextFit);
    }, dependencies ?? []);

    return { hasEnoughSpace, contentRef, containerRef };
}