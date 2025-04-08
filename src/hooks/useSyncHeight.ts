/**
 * @hook useSyncHeight
 *
 * @description
 * Custom hook that synchronizes an element's height based on another element's height.
 * Uses ResizeObserver to automatically detect size changes in the reference element.
 *
 * @param {React.RefObject<HTMLElement | null>} sourceRef - Reference to the HTML element whose height will be monitored
 *
 * @returns {string} Height value formatted as CSS string (e.g., "100px" or "100%")
 *
 * @example
 * // In the component
 * const contentRef = useRef<HTMLDivElement>(null);
 * const height = useSyncHeight(contentRef);
 *
 * return (
 *   <div>
 *     <div ref={contentRef}>Main content</div>
 *     <div style={{ height }}>This element will have the same height as the main content</div>
 *   </div>
 * );
 **/

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

        updateHeight();

        resizeObserver.current = new ResizeObserver(updateHeight);
        resizeObserver.current.observe(sourceRef.current);

        return () => {
            resizeObserver.current?.disconnect();
        };
    }, [sourceRef]);

    return height;
};