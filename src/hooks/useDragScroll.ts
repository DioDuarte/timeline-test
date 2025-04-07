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