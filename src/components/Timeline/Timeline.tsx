import { useLocalization } from "../../context/LocalizationContext";
import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO, startOfWeek } from 'date-fns';
import { TimelineContainer, ScrollContainer, TimelineBody, TimelineWrapper } from './styles';
import { TimelineItem as TimelineItemType } from '../../types/types';
import { assignLanes } from '../../utils/assignLanes';
import { useTimelineConfig } from '../../context/TimelineContext';
import {
    expandMaxDate,
    expandMinDate,
    getTimelineDates,
} from '../../utils/dateUtils';
import ItemsListPanel from '../TimelinePanel/TimelinePanel';
import { DragEndEvent } from '@dnd-kit/core';
import { useDragScroll } from '../../hooks/useDragScroll';
import { useZoomControl } from '../../hooks/useZoomControl';
import { getFixedColumnWidth, handleItemDragEnd } from '../../utils/timelineUtils';
import TimelineControlsComponent from './TimelineControls';
import TimelineHeaderComponent from './TimeLineHeader';
import TimelineGridComponent from './TimelineGrid';
import TimelineInstructions from './TimelineInstructions';

export interface TimelineProps {
    items: TimelineItemType[];
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
    const { zoomLevel, setZoomLevel, paddingDaysBefore, paddingDaysAfter } = useTimelineConfig();
    const { locale } = useLocalization();
    const containerRef = useRef<HTMLDivElement>(null);
    const previousDatesLengthRef = useRef<number>(0);

    const [itemsWithLanes, setItemsWithLanes] = useState<TimelineItemType[]>([]);
    const [dynamicMinDate, setDynamicMinDate] = useState<Date | null>(null);
    const [dynamicMaxDate, setDynamicMaxDate] = useState<Date | null>(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<number | undefined>();
    const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);

    const sortedItems = [...items].sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
    const initialMinDate = sortedItems.length > 0 ? parseISO(sortedItems[0].start) : new Date();
    const initialMaxDate = sortedItems.length > 0 ? parseISO(sortedItems[sortedItems.length - 1].end) : new Date();
    const currentMinDate = dynamicMinDate || initialMinDate;
    const currentMaxDate = dynamicMaxDate || initialMaxDate;
    const timelineDates = getTimelineDates(currentMinDate, currentMaxDate, zoomLevel, paddingDaysBefore, paddingDaysAfter);
    const columnWidth = getFixedColumnWidth(zoomLevel);
    const totalGridWidth = columnWidth * timelineDates.length;

    const maxLane = Math.max(...itemsWithLanes.map((item) => item.lane || 0), 0);
    const activeLanes = Array.from({ length: maxLane + 1 }, (_, i) => i);
    const totalGridHeight = activeLanes.length * 60;

    const { isDragging, setIsDragging, handleMouseDown, handleMouseMove } = useDragScroll(containerRef);

    const { handleWheel, handleZoomChange } = useZoomControl(
        zoomLevel,
        setZoomLevel,
        setDynamicMinDate,
        setDynamicMaxDate,
        timelineDates,
        columnWidth,
        containerRef,
        items
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheelEvent = (event: WheelEvent) => {
            if (event.altKey) {
                event.preventDefault();
                event.stopPropagation();
                handleWheel(event as any);
            }
        };

        container.addEventListener('wheel', handleWheelEvent, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheelEvent);
        };
    }, [handleWheel]);

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        if (isItemModalOpen) return;
        handleItemDragEnd(event, itemsWithLanes, timelineDates, columnWidth, zoomLevel, setItemsWithLanes, (start, end) => {
            if (end > currentMaxDate) setDynamicMaxDate(expandMaxDate(currentMaxDate, zoomLevel));
            if (start < currentMinDate) setDynamicMinDate(expandMinDate(currentMinDate, zoomLevel));
        });
    };

    const findDateIndex = (date: Date) => {
        switch (zoomLevel) {
            case 'day':
                return timelineDates.findIndex((d) => format(d, 'yyyy-MM-dd', { locale }) === format(date, 'yyyy-MM-dd', { locale }));
            case 'week':
                return timelineDates.findIndex((d) => {
                    const weekStart = startOfWeek(d, { locale, weekStartsOn: 1 });
                    const itemWeekStart = startOfWeek(date, { locale, weekStartsOn: 1 });
                    return format(weekStart, 'yyyy-MM-dd', { locale }) === format(itemWeekStart, 'yyyy-MM-dd', { locale });
                });
            case 'month':
                return timelineDates.findIndex((d) => format(d, 'yyyy-MM', { locale }) === format(date, 'yyyy-MM', { locale }));
            default:
                return -1;
        }
    };

    const scrollToItem = (item: TimelineItemType) => {
        setSelectedItemId(item.id);

        if (!containerRef.current) return;

        const { clientWidth: containerWidth, scrollLeft: currentScroll, scrollWidth: totalWidth } = containerRef.current;

        const itemStart = parseISO(item.start);
        const itemEnd = parseISO(item.end);

        const startIndex = findDateIndex(itemStart);
        const endIndex = findDateIndex(itemEnd);

        if (startIndex === -1 || endIndex === -1) {
            const newMinDate = itemStart < timelineDates[0] ? itemStart : timelineDates[0];
            const newMaxDate = itemEnd > timelineDates[timelineDates.length - 1] ? itemEnd : timelineDates[timelineDates.length - 1];
            setDynamicMinDate(newMinDate);
            setDynamicMaxDate(newMaxDate);
            return;
        }

        const itemStartPixel = startIndex * columnWidth;
        const itemWidth = (endIndex - startIndex + 1) * columnWidth;
        const itemCenterPixel = itemStartPixel + (itemWidth / 2);

        let targetScroll = itemCenterPixel - (containerWidth / 2);
        targetScroll = Math.max(0, Math.min(targetScroll, totalWidth - containerWidth));

        const isOutOfView = itemStartPixel < currentScroll || (itemStartPixel + itemWidth) > (currentScroll + containerWidth);
        const scrollDistance = Math.abs(targetScroll - currentScroll);
        const behavior = (isOutOfView || scrollDistance > columnWidth) ? 'smooth' : 'auto';

        containerRef.current.scrollTo({
            left: targetScroll,
            behavior,
        });
    };

    useEffect(() => {
        setItemsWithLanes(assignLanes(items));
    }, [items]);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (entry.target.id === 'sentinel-left' && containerRef.current!.scrollLeft < 100) {
                            const previousLength = timelineDates.length;
                            const newMinDate = expandMinDate(currentMinDate, zoomLevel);
                            const newDates = getTimelineDates(newMinDate, currentMaxDate, zoomLevel, paddingDaysBefore, paddingDaysAfter);
                            const addedColumns = newDates.length - previousLength;
                            const scrollAdjustment = addedColumns * columnWidth;

                            containerRef.current!.scrollLeft += scrollAdjustment;
                            setDynamicMinDate(newMinDate);
                            previousDatesLengthRef.current = newDates.length;
                        } else if (entry.target.id === 'sentinel-right') {
                            const newMaxDate = expandMaxDate(currentMaxDate, zoomLevel);
                            setDynamicMaxDate(newMaxDate);
                        }
                    }
                });
            },
            {
                root: containerRef.current,
                threshold: 0,
                rootMargin: '0px 0px 0px 200px',
            }
        );

        const leftSentinel = document.getElementById('sentinel-left');
        const rightSentinel = document.getElementById('sentinel-right');
        if (leftSentinel) observer.observe(leftSentinel);
        if (rightSentinel) observer.observe(rightSentinel);

        return () => observer.disconnect();
    }, [currentMinDate, currentMaxDate, zoomLevel, timelineDates, columnWidth]);

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);


    return (
        <TimelineWrapper>
            <TimelineContainer>
                <TimelineControlsComponent
                    zoomLevel={zoomLevel}
                    setZoomLevel={handleZoomChange}
                />
                <ScrollContainer
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                    <TimelineHeaderComponent
                        timelineDates={timelineDates}
                        zoomLevel={zoomLevel}
                        columnWidth={columnWidth}
                    />
                    <TimelineBody>
                        <TimelineGridComponent
                            isItemModalOpen={isItemModalOpen}
                            hoveredItemId={hoveredItemId}
                            selectedItemId={selectedItemId}
                            setItemsWithLanes={setItemsWithLanes}
                            currentMaxDate={currentMaxDate}
                            currentMinDate={currentMinDate}
                            setIsItemModalOpen={setIsItemModalOpen}
                            itemsWithLanes={itemsWithLanes}
                            timelineDates={timelineDates}
                            columnWidth={columnWidth}
                            totalGridWidth={totalGridWidth}
                            totalGridHeight={totalGridHeight}
                            onDragEnd={handleDragEnd}
                        />
                    </TimelineBody>
                </ScrollContainer>
                <TimelineInstructions />
            </TimelineContainer>
            <ItemsListPanel
                items={itemsWithLanes}
                selectedItemId={selectedItemId}
                onItemSelect={scrollToItem}
                timelineRef={containerRef}
                onItemHover={setHoveredItemId}
            />
        </TimelineWrapper>
    );
};

export default Timeline;