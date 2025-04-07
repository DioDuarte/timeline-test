import React from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { TimelineItem as TimelineItemType, ZoomLevel } from '../../types/types';
import { TimelineGrid, VerticalGridLine, HorizontalGridLine, Sentinel } from './styles';
import TimelineItem from '../TimelineItem/TimelineItem';

interface TimelineGridProps {
    itemsWithLanes: TimelineItemType[];
    timelineDates: Date[];
    columnWidth: number;
    totalGridWidth: number;
    totalGridHeight: number;
    onDragEnd: (event: DragEndEvent) => void;
    setIsItemModalOpen: (isOpen: boolean) => void;
    isItemModalOpen: boolean;
    currentMinDate: Date;
    currentMaxDate: Date;
    setItemsWithLanes: (items: TimelineItemType[]) => void;
    hoveredItemId?: number | null;
    selectedItemId?: number | null;
}

const TimelineGridComponent: React.FC<TimelineGridProps> = ({
                                                                itemsWithLanes,
                                                                timelineDates,
                                                                columnWidth,
                                                                totalGridWidth,
                                                                totalGridHeight,
                                                                onDragEnd,
                                                                setIsItemModalOpen,
                                                                currentMinDate,
                                                                currentMaxDate,
                                                                setItemsWithLanes,
                                                                hoveredItemId,
                                                                selectedItemId,
                                                                isItemModalOpen
                                                            }) => {
    const maxLane = Math.max(...itemsWithLanes.map((item) => item.lane || 0), 0);
    const activeLanes = Array.from({ length: maxLane + 1 }, (_, i) => i);

    return (
        <DndContext onDragEnd={onDragEnd}>
            <TimelineGrid style={{ width: `${totalGridWidth}px`, minHeight: `${totalGridHeight}px` }}>
                <Sentinel id="sentinel-left" style={{ left: '0px', width: '50px', height: `${totalGridHeight}px` }} />
                {activeLanes.map((laneId) =>
                    itemsWithLanes
                        .filter((item) => item.lane === laneId)
                        .map((item) => (
                            <TimelineItem
                                key={item.id}
                                item={item}
                                onModalStateChange={setIsItemModalOpen}
                                items={itemsWithLanes}
                                minDate={currentMinDate}
                                maxDate={currentMaxDate}
                                totalWidth={totalGridWidth}
                                columnWidth={columnWidth}
                                maxLanes={activeLanes.length}
                                onItemChange={setItemsWithLanes}
                                isHovered={item.id === hoveredItemId}
                                isSelected={item.id === selectedItemId}
                            />
                        ))
                )}
                {timelineDates.map((date, dateIndex) => (
                    <VerticalGridLine
                        key={dateIndex}
                        style={{ left: `${dateIndex * columnWidth}px`, height: `${totalGridHeight}px` }}
                        isWeekend={date.getDay() === 0 || date.getDay() === 6}
                        isMonthStart={date.getDate() === 1}
                    />
                ))}
                {activeLanes.slice(0, -1).map((laneId, index) => (
                    <HorizontalGridLine
                        key={`h-line-${laneId}`}
                        style={{ top: (laneId + 1) * 60 }}
                        totalWidth={totalGridWidth}
                    />
                ))}
                <Sentinel
                    id="sentinel-right"
                    style={{ left: `${totalGridWidth - 50}px`, width: '50px', height: `${totalGridHeight}px` }}
                />
            </TimelineGrid>
        </DndContext>
    );
};

export default TimelineGridComponent;