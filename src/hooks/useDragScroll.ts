/**
 * @hook useDragScroll
 *
 * @description
 * Custom hook that implements drag-to-scroll functionality for a scrollable element.
 * Allows users to click and drag to navigate content horizontally, similar to panning behavior
 * in maps and other interfaces.
 *
 * @param {React.RefObject<HTMLDivElement | null>} containerRef - Reference to the scrollable HTML element
 *
 * @returns {Object} Object containing:
 *   - isDragging: Boolean state indicating whether the user is currently dragging
 *   - setIsDragging: Function to manually update the dragging state
 *   - handleMouseDown: Handler for mousedown event that initiates dragging
 *   - handleMouseMove: Handler for mousemove event that performs scrolling
 *
 * @example
 * // In the component
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { isDragging, handleMouseDown, handleMouseMove } = useDragScroll(containerRef);
 *
 * return (
 *   <div
 *     ref={containerRef}
 *     onMouseDown={handleMouseDown}
 *     onMouseMove={handleMouseMove}
 *     style={{ cursor: isDragging ? 'grabbing' : 'grab', overflow: 'auto' }}
 *   >
 *     {/* Scrollable content *\}
*   </div>
* );
*/

import { useState, useEffect, useCallback } from 'react';

export function useDragScroll(containerRef: React.RefObject<HTMLDivElement | null>) {
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftStart, setScrollLeftStart] = useState(0);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('.timeline-item')) return;
        setIsDragging(true);
        setStartX(e.pageX);
        setScrollLeftStart(containerRef.current?.scrollLeft || 0);
        e.preventDefault();
    }, [containerRef]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !containerRef.current) return;
        const deltaX = e.pageX - startX;
        containerRef.current.scrollLeft = scrollLeftStart - deltaX;
    }, [isDragging, startX, scrollLeftStart, containerRef]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseUp]);

    return { isDragging, setIsDragging, handleMouseDown, handleMouseMove };
}