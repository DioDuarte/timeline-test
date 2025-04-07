// hooks/useSyncHeight.ts
import React, { useState, useEffect, useRef } from 'react';

export const useSyncHeight = (sourceRef: React.RefObject<HTMLElement | null>) => {
    const [height, setHeight] = useState('100%');
    const resizeObserver = useRef<ResizeObserver | null>(null);

    useEffect(() => {
        if (!sourceRef.current) return;

        const updateHeight = () => {
            if (sourceRef.current) {
                setHeight(`${sourceRef.current.clientHeight}px`);
            }
        };

        // Atualiza imediatamente
        updateHeight();

        // Configura o observer para mudanças futuras
        resizeObserver.current = new ResizeObserver(updateHeight);
        resizeObserver.current.observe(sourceRef.current);

        return () => {
            resizeObserver.current?.disconnect();
        };
    }, [sourceRef]);

    return height;
};