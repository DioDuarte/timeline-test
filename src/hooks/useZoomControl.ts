import React, { useCallback } from 'react';
import {TimelineItem as TimelineItemType, ZoomLevel} from '../types/types';
import { getTimelineDates, expandMinDate, expandMaxDate } from '../utils/dateUtils';
import {addDays, differenceInDays, format, parseISO, subDays} from 'date-fns';
import { getFixedColumnWidth } from '../utils/timelineUtils';


export const useZoomControl = (
    zoomLevel: ZoomLevel,
    setZoomLevel: (zoom: ZoomLevel) => void,
    setDynamicMinDate: (date: Date | null) => void,
    setDynamicMaxDate: (date: Date | null) => void,
    timelineDates: Date[],
    columnWidth: number,
    containerRef: React.RefObject<HTMLDivElement | null>,
    items?: TimelineItemType[] // Optional: for centering on first item during direct zoom
) => {
    // Map zoom levels to visible days
    const getVisibleDays = useCallback((zoom: ZoomLevel): number => {
        switch (zoom) {
            case 'day':
                return 30; // ~1 month
            case 'week':
                return 90; // ~3 months
            case 'month':
                return 365; // ~1 year
            default:
                return 30;
        }
    }, []);

    // Handle wheel-based zooming (with Alt key)
    const handleWheel = useCallback(
        (event: React.WheelEvent<HTMLDivElement>) => {
            if (!event.altKey || !containerRef.current) return;

            event.preventDefault();

            const zoomLevels: ZoomLevel[] = ['month', 'week', 'day'];
            const currentIndex = zoomLevels.indexOf(zoomLevel);
            // Normalize delta: positive delta (scroll down) zooms in, negative (scroll up) zooms out
            const delta = event.deltaY > 0 ? -1 : 1;
            const newIndex = Math.min(Math.max(currentIndex + delta, 0), zoomLevels.length - 1);

            if (newIndex === currentIndex) return;

            const newZoomLevel = zoomLevels[newIndex];

            // Get mouse position relative to container
            const containerRect = containerRef.current.getBoundingClientRect();
            const mouseX = event.clientX - containerRect.left + containerRef.current.scrollLeft;
            const columnIndex = Math.floor(mouseX / columnWidth);
            const centerDate = timelineDates[Math.max(0, Math.min(columnIndex, timelineDates.length - 1))];

            // Calculate new min and max dates
            const newVisibleDays = getVisibleDays(newZoomLevel);
            const halfVisibleDays = Math.floor(newVisibleDays / 2);
            const newMinDate = subDays(centerDate, halfVisibleDays);
            const newMaxDate = addDays(centerDate, halfVisibleDays);

            // Update state
            setZoomLevel(newZoomLevel);
            setDynamicMinDate(newMinDate);
            setDynamicMaxDate(newMaxDate);

            // Adjust scroll to keep centerDate in view
            setTimeout(() => {
                if (containerRef.current) {
                    const newTimelineDates = getTimelineDates(newMinDate, newMaxDate, newZoomLevel, 0, 0);
                    const newColumnWidth = getFixedColumnWidth(newZoomLevel);
                    const newCenterIndex = newTimelineDates.findIndex(
                        (d) => format(d, 'yyyy-MM-dd') === format(centerDate, 'yyyy-MM-dd')
                    );
                    if (newCenterIndex !== -1) {
                        const newScrollLeft = newCenterIndex * newColumnWidth - containerRef.current.clientWidth / 2;
                        containerRef.current.scrollLeft = Math.max(0, newScrollLeft);
                    }
                }
            }, 0);
        },
        [
            zoomLevel,
            setZoomLevel,
            setDynamicMinDate,
            setDynamicMaxDate,
            timelineDates,
            columnWidth,
            containerRef,
            getVisibleDays,
        ]
    );

    // Handle direct zoom level change (e.g., via UI controls)
    const handleZoomChange = useCallback(
        (newZoomLevel: ZoomLevel, centerDate?: Date) => {
            if (newZoomLevel === zoomLevel) return;

            // Default to first item's start date if no centerDate provided and items are available
            let targetDate = centerDate;
            if (!targetDate && items && items.length > 0) {
                const sortedItems = [...items].sort(
                    (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()
                );
                targetDate = parseISO(sortedItems[0].start);
            }
            // Fallback to current minDate if no items or centerDate
            if (!targetDate) {
                targetDate = timelineDates[0] || new Date();
            }

            // Calculate new min and max dates
            const newVisibleDays = getVisibleDays(newZoomLevel);
            const halfVisibleDays = Math.floor(newVisibleDays / 2);
            const newMinDate = subDays(targetDate, halfVisibleDays);
            const newMaxDate = addDays(targetDate, halfVisibleDays);

            // Update state
            setZoomLevel(newZoomLevel);
            setDynamicMinDate(newMinDate);
            setDynamicMaxDate(newMaxDate);

            // Adjust scroll to center on targetDate
            setTimeout(() => {
                if (containerRef.current) {
                    const newTimelineDates = getTimelineDates(newMinDate, newMaxDate, newZoomLevel, 0, 0);
                    const newColumnWidth = getFixedColumnWidth(newZoomLevel);
                    const newCenterIndex = newTimelineDates.findIndex(
                        (d) => format(d, 'yyyy-MM-dd') === format(targetDate!, 'yyyy-MM-dd')
                    );
                    if (newCenterIndex !== -1) {
                        const newScrollLeft = newCenterIndex * newColumnWidth - containerRef.current.clientWidth / 2;
                        containerRef.current.scrollLeft = Math.max(0, newScrollLeft);
                    }
                }
            }, 0);
        },
        [
            zoomLevel,
            setZoomLevel,
            setDynamicMinDate,
            setDynamicMaxDate,
            timelineDates,
            items,
            containerRef,
            getVisibleDays,
        ]
    );

    return { handleWheel, handleZoomChange };
};