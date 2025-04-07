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
    focusIndicatorVisible: boolean;
    focusIndicatorPosition: number;
    focusTooltipText: string;
    onDragEnd: (event: DragEndEvent) => void;
    setIsItemModalOpen: (isOpen: boolean) => void;
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
                                                                focusIndicatorVisible,
                                                                focusIndicatorPosition,
                                                                focusTooltipText,
                                                                onDragEnd,
                                                                setIsItemModalOpen,
                                                                currentMinDate,
                                                                currentMaxDate,
                                                                setItemsWithLanes,
                                                                hoveredItemId,
                                                                selectedItemId
                                                            }) => {
    const maxLane = Math.max(...itemsWithLanes.map((item) => item.lane || 0), 0);
    const activeLanes = Array.from({ length: maxLane + 1 }, (_, i) => i);

    return (
        <DndContext onDragEnd={onDragEnd}>
            <TimelineGrid style={{ width: `${totalGridWidth}px`, minHeight: `${totalGridHeight}px` }}>
                <Sentinel id="sentinel-left" style={{ left: '0px', width: '50px', height: `${totalGridHeight}px` }} />
                {focusIndicatorVisible && (
                    <div
                        style={{
                            position: 'absolute',
                            left: `${focusIndicatorPosition}px`,
                            top: '0',
                            height: '100%',
                            width: '2px',
                            backgroundColor: '#ff6b6b',
                            zIndex: 10,
                            opacity: focusIndicatorVisible ? 0.8 : 0,
                            transition: 'opacity 0.3s ease',
                            boxShadow: '0 0 8px rgba(255, 107, 107, 0.8)',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: '-40px',
                                left: '-50px',
                                width: '120px',
                                backgroundColor: '#333',
                                color: 'white',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                textAlign: 'center',
                                opacity: 1,
                                transition: 'opacity 0.2s ease',
                                pointerEvents: 'none',
                                zIndex: 20,
                                whiteSpace: 'nowrap',
                                fontWeight: 'bold',
                            }}
                        >
                            {focusTooltipText}
                        </div>
                        <div
                            style={{
                                position: 'absolute',
                                top: '-10px',
                                left: '-5px',
                                width: '12px',
                                height: '12px',
                                backgroundColor: '#ff6b6b',
                                borderRadius: '50%',
                                boxShadow: '0 0 8px rgba(255, 107, 107, 0.8)',
                            }}
                        />
                    </div>
                )}
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