// src/hooks/useZoomControl.ts
import { useCallback } from 'react';
import { ZoomLevel } from '../types/types';

export function useZoomControl(
    zoomLevel: ZoomLevel,
    setZoomLevel: (zoom: ZoomLevel) => void,
    resetDynamicDates: () => void
) {
    const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
        if (e.altKey) {
            e.preventDefault();
            const zoomLevels: ZoomLevel[] = ['day', 'week', 'month'];
            const currentIndex = zoomLevels.indexOf(zoomLevel);
            let newIndex = currentIndex + (e.deltaY > 0 ? 1 : -1);
            newIndex = Math.max(0, Math.min(newIndex, zoomLevels.length - 1));
            const newZoomLevel = zoomLevels[newIndex];
            setZoomLevel(newZoomLevel);
            resetDynamicDates();
        }
    }, [zoomLevel, setZoomLevel, resetDynamicDates]);

    return { handleWheel };
}