import React from 'react';
import { ZoomLevel } from '../../types/types';
import { formatTimelineHeaderDate, formatDayOfWeek } from '../../utils/formatUtils';
import { TimelineHeader, DateHeaderContainer, DateHeaderCell } from './styles';

interface TimelineHeaderProps {
    timelineDates: Date[];
    zoomLevel: ZoomLevel;
    columnWidth: number;
}

const TimelineHeaderComponent: React.FC<TimelineHeaderProps> = ({
                                                                    timelineDates,
                                                                    zoomLevel,
                                                                    columnWidth,
                                                                }) => {
    const totalGridWidth = columnWidth * timelineDates.length;

    return (
        <TimelineHeader style={{ width: `${totalGridWidth}px` }}>
            <DateHeaderContainer>
                <div className="date-row">
                    {timelineDates.map((date, index) => (
                        <DateHeaderCell
                            key={index}
                            style={{ width: `${columnWidth}px` }}
                            isLast={index === timelineDates.length - 1}
                            isWeekend={date.getDay() === 0 || date.getDay() === 6}
                        >
                            {formatTimelineHeaderDate(date, zoomLevel)}
                            {zoomLevel === 'day' && (
                                <span className="day-of-week">{formatDayOfWeek(date)}</span>
                            )}
                        </DateHeaderCell>
                    ))}
                </div>
            </DateHeaderContainer>
        </TimelineHeader>
    );
};

export default TimelineHeaderComponent;