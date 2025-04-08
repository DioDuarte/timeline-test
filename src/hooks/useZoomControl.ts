/**
 * @hook useZoomControl
 *
 * @description
 * Custom hook that manages zoom controls for a Timeline component.
 * Allows switching between different zoom levels (day, week, month) and maintains
 * the focal point during zoom operations.
 *
 * @param {ZoomLevel} zoomLevel - Current zoom level ('day', 'week', or 'month')
 * @param {Function} setZoomLevel - Function to update the zoom level
 * @param {Function} setDynamicMinDate - Function to update the minimum visible date
 * @param {Function} setDynamicMaxDate - Function to update the maximum visible date
 * @param {Date[]} timelineDates - Array of dates displayed in the timeline
 * @param {number} columnWidth - Width of each timeline column (in pixels)
 * @param {React.RefObject<HTMLDivElement | null>} containerRef - Reference to the DOM element containing the timeline
 * @param {TimelineItemType[]} [items] - Optional list of timeline items for centering
 *
 * @returns {Object} Object containing:
 *   - handleWheel: Function that manages zoom events via scroll with Alt key
 *   - handleZoomChange: Function to directly change zoom level
 *
 * @example
 * // In the Timeline component
 * const { handleWheel, handleZoomChange } = useZoomControl(
 *   zoomLevel,
 *   setZoomLevel,
 *   setDynamicMinDate,
 *   setDynamicMaxDate,
 *   timelineDates,
 *   columnWidth,
 *   containerRef,
 *   items
 * );
 *
 * // Using the wheel handler for zoom
 * useEffect(() => {
 *   const container = containerRef.current;
 *   if (!container) return;
 *
 *   const handleWheelEvent = (event: WheelEvent) => {
 *     if (event.altKey) {
 *       event.preventDefault();
 *       handleWheel(event as any);
 *     }
 *   };
 *
 *   container.addEventListener('wheel', handleWheelEvent, { passive: false });
 *   return () => container.removeEventListener('wheel', handleWheelEvent);
 * }, [handleWheel]);
 *
 * // Using the direct zoom change handler
 * <TimelineControlsComponent
 *   zoomLevel={zoomLevel}
 *   setZoomLevel={handleZoomChange}
 * />
 */

import React, { useCallback } from 'react';
import {TimelineItem as TimelineItemType, ZoomLevel} from '../types/types';
import { getTimelineDates } from '../utils/dateUtils';
import {addDays, format, parseISO, subDays} from 'date-fns';
import { getFixedColumnWidth } from '../utils/timelineUtils';


export const useZoomControl = (
    zoomLevel: ZoomLevel,
    setZoomLevel: (zoom: ZoomLevel) => void,
    setDynamicMinDate: (date: Date | null) => void,
    setDynamicMaxDate: (date: Date | null) => void,
    timelineDates: Date[],
    columnWidth: number,
    containerRef: React.RefObject<HTMLDivElement | null>,
    items?: TimelineItemType[]
) => {

    const getVisibleDays = useCallback((zoom: ZoomLevel): number => {
        switch (zoom) {
            case 'day':
                return 30;
            case 'week':
                return 90;
            case 'month':
                return 365;
            default:
                return 30;
        }
    }, []);


    const handleWheel = useCallback(
        (event: React.WheelEvent<HTMLDivElement>) => {
            if (!event.altKey || !containerRef.current) return;

            event.preventDefault();

            const zoomLevels: ZoomLevel[] = ['month', 'week', 'day'];
            const currentIndex = zoomLevels.indexOf(zoomLevel);
            const delta = event.deltaY > 0 ? -1 : 1;
            const newIndex = Math.min(Math.max(currentIndex + delta, 0), zoomLevels.length - 1);

            if (newIndex === currentIndex) return;

            const newZoomLevel = zoomLevels[newIndex];

            const containerRect = containerRef.current.getBoundingClientRect();
            const mouseX = event.clientX - containerRect.left + containerRef.current.scrollLeft;
            const columnIndex = Math.floor(mouseX / columnWidth);
            const centerDate = timelineDates[Math.max(0, Math.min(columnIndex, timelineDates.length - 1))];

            const newVisibleDays = getVisibleDays(newZoomLevel);
            const halfVisibleDays = Math.floor(newVisibleDays / 2);
            const newMinDate = subDays(centerDate, halfVisibleDays);
            const newMaxDate = addDays(centerDate, halfVisibleDays);

            setZoomLevel(newZoomLevel);
            setDynamicMinDate(newMinDate);
            setDynamicMaxDate(newMaxDate);

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

    const handleZoomChange = useCallback(
        (newZoomLevel: ZoomLevel, centerDate?: Date) => {
            if (newZoomLevel === zoomLevel) return;

            let targetDate = centerDate;
            if (!targetDate && items && items.length > 0) {
                const sortedItems = [...items].sort(
                    (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()
                );
                targetDate = parseISO(sortedItems[0].start);
            }
            if (!targetDate) {
                targetDate = timelineDates[0] || new Date();
            }

            const newVisibleDays = getVisibleDays(newZoomLevel);
            const halfVisibleDays = Math.floor(newVisibleDays / 2);
            const newMinDate = subDays(targetDate, halfVisibleDays);
            const newMaxDate = addDays(targetDate, halfVisibleDays);

            setZoomLevel(newZoomLevel);
            setDynamicMinDate(newMinDate);
            setDynamicMaxDate(newMaxDate);


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