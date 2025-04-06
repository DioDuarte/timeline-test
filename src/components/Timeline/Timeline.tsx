import React, { useState, useEffect, useRef } from 'react';
import {
    differenceInCalendarDays,
    format,
    parseISO,
    startOfDay,
    addDays,
    addWeeks,
    addMonths,
    startOfWeek,
    endOfWeek,
    subDays,
    subWeeks,
    subMonths
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    TimelineContainer,
    TimelineControls,
    ZoomButton,
    ScrollContainer,
    TimelineHeader,
    DateHeaderContainer,
    DateHeaderCell,
    TimelineBody,
    TimelineGrid,
    VerticalGridLine,
    HorizontalGridLine,
    Instructions,
    EmptyCell
} from './styles';
import { TimelineItem as TimelineItemType, ZoomLevel } from '../../types/types';
import { assignLanes } from '../../utils/assignLanes';
import { useTimelineConfig } from '../../context/TimelineContext';
import { getDateRange, getTimelineDates } from '../../utils/dateUtils';
import TimelineItem from '../TimelineItem/TimelineItem';
import ScrollArrows from '../common/ScrollArrow/ScrollArrow';
import { DndContext, DragEndEvent } from '@dnd-kit/core';

interface TimelineProps {
    items: TimelineItemType[];
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
    const [itemsWithLanes, setItemsWithLanes] = useState<TimelineItemType[]>([]);
    const [containerWidth, setContainerWidth] = useState(0);
    const [dynamicMinDate, setDynamicMinDate] = useState<Date | null>(null);
    const [dynamicMaxDate, setDynamicMaxDate] = useState<Date | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftStart, setScrollLeftStart] = useState(0);

    const { zoomLevel, setZoomLevel, paddingDaysBefore, paddingDaysAfter } = useTimelineConfig();

    // Obter os limites iniciais dos itens e adicionar padding extra baseado no zoom
    const { minDate: initialMinDate, maxDate: initialMaxDate } = getDateRange(items);

    // Ajustar os limites iniciais com base no zoomLevel
    const adjustInitialDates = (minDate: Date, maxDate: Date, zoom: ZoomLevel) => {
        let adjustedMinDate: Date;
        let adjustedMaxDate: Date;

        switch (zoom) {
            case 'day':
                adjustedMinDate = subDays(minDate, 30); // 30 dias antes
                adjustedMaxDate = addDays(maxDate, 30); // 30 dias depois
                break;
            case 'week':
                adjustedMinDate = subWeeks(minDate, 20); // 20 semanas antes
                adjustedMaxDate = addWeeks(maxDate, 20); // 20 semanas depois
                break;
            case 'month':
                adjustedMinDate = subMonths(minDate, 12); // 12 meses antes
                adjustedMaxDate = addMonths(maxDate, 12); // 12 meses depois
                break;
            default:
                adjustedMinDate = minDate;
                adjustedMaxDate = maxDate;
        }

        return { adjustedMinDate, adjustedMaxDate };
    };

    const { adjustedMinDate, adjustedMaxDate } = adjustInitialDates(initialMinDate, initialMaxDate, zoomLevel);

    // Usar os limites ajustados ou os dinâmicos (se houver expansão)
    const currentMinDate = dynamicMinDate || adjustedMinDate;
    const currentMaxDate = dynamicMaxDate || adjustedMaxDate;
    const timelineDates = getTimelineDates(currentMinDate, currentMaxDate, zoomLevel, paddingDaysBefore, paddingDaysAfter);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        window.addEventListener('resize', updateWidth);
        updateWidth();

        return () => window.removeEventListener('resize', updateWidth);
    }, [timelineDates.length, zoomLevel, itemsWithLanes.length]);

    const expandMinDate = (currentMin: Date) => {
        switch (zoomLevel) {
            case 'day': return subDays(currentMin, 7);
            case 'week': return subWeeks(currentMin, 2);
            case 'month': return subMonths(currentMin, 1);
            default: return currentMin;
        }
    };

    const expandMaxDate = (currentMax: Date) => {
        switch (zoomLevel) {
            case 'day': return addDays(currentMax, 7);
            case 'week': return addWeeks(currentMax, 2);
            case 'month': return addMonths(currentMax, 1);
            default: return currentMax;
        }
    };

    useEffect(() => {
        const newItemsWithLanes = assignLanes(items);
        setItemsWithLanes(newItemsWithLanes);

        const firstDate = timelineDates[0];
        const lastDate = timelineDates[timelineDates.length - 1];

        const itemsAtStart = newItemsWithLanes.some(item => {
            const startDate = parseISO(item.start);
            return startDate < firstDate;
        });

        const itemsAtEnd = newItemsWithLanes.some(item => {
            const endDate = parseISO(item.end);
            return endDate > lastDate;
        });

        if (itemsAtStart && !dynamicMinDate) {
            setDynamicMinDate(expandMinDate(initialMinDate));
        }
        if (itemsAtEnd && !dynamicMaxDate) {
            setDynamicMaxDate(expandMaxDate(initialMaxDate));
        }
    }, [items, timelineDates]);

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (e.altKey) {
            e.preventDefault();
            const zoomLevels: ZoomLevel[] = ['day', 'week', 'month'];
            const currentIndex = zoomLevels.indexOf(zoomLevel);
            let newIndex = currentIndex + (e.deltaY > 0 ? 1 : -1);
            newIndex = Math.max(0, Math.min(newIndex, zoomLevels.length - 1));
            setZoomLevel(zoomLevels[newIndex]);
            setDynamicMinDate(null);
            setDynamicMaxDate(null);
        }
    };

    const handleItemChange = (updatedItems: TimelineItemType[]) => {
        if (updatedItems.length === 1) {
            const updatedItem = updatedItems[0];
            const newItemsWithLanes = itemsWithLanes.map(i =>
                i.id === updatedItem.id ? updatedItem : i
            );
            setItemsWithLanes(assignLanes(newItemsWithLanes));
        } else {
            setItemsWithLanes(assignLanes(updatedItems));
        }
    };

    const maxLane = Math.max(...itemsWithLanes.map(item => item.lane || 0), 0);
    const activeLanes = Array.from({ length: maxLane + 1 }, (_, i) => i);

    const formatHeaderDate = (date: Date) => {
        switch (zoomLevel) {
            case 'day':
                return format(date, 'd');
            case 'week':
                return `${format(startOfWeek(date, { locale: ptBR, weekStartsOn: 1 }), 'dd/MM')} - ${format(endOfWeek(date, { locale: ptBR, weekStartsOn: 1 }), 'dd/MM')}`;
            case 'month':
                return format(date, 'MMM yyyy', { locale: ptBR });
        }
    };

    const shouldShowMonth = (date: Date, index: number) => {
        if (zoomLevel !== 'day') return false;
        if (index === 0) return true;
        const prevDate = timelineDates[index - 1];
        return date.getMonth() !== prevDate.getMonth();
    };

    const getColumnWidth = () => {
        const minColumnWidth = 60;
        const calculatedWidth = containerWidth / timelineDates.length;
        return Math.max(minColumnWidth, calculatedWidth);
    };

    const columnWidth = getColumnWidth();
    const totalGridWidth = columnWidth * timelineDates.length;
    const totalGridHeight = activeLanes.length * 60;

    const dateCoverage = React.useMemo(() => {
        const coverage: { [laneId: number]: { [dateStr: string]: boolean } } = {};
        for (let laneId = 0; laneId <= maxLane; laneId++) {
            coverage[laneId] = {};
            timelineDates.forEach(date => {
                coverage[laneId][format(date, 'yyyy-MM-dd')] = false;
            });
        }
        itemsWithLanes.forEach(item => {
            const laneId = typeof item.lane === 'number' ? item.lane : 0;
            const startDate = parseISO(item.start);
            const endDate = parseISO(item.end);
            timelineDates.forEach(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const currentDate = parseISO(dateStr);
                const normalizedStartDate = startOfDay(startDate);
                const normalizedEndDate = startOfDay(endDate);
                const normalizedCurrentDate = startOfDay(currentDate);
                if (normalizedCurrentDate >= normalizedStartDate && normalizedCurrentDate <= normalizedEndDate) {
                    coverage[laneId][dateStr] = true;
                }
            });
        });
        return coverage;
    }, [itemsWithLanes, timelineDates, maxLane]);

    const calculateNewDate = (pixelOffset: number, referenceDate: Date, firstDate: Date, lastDate: Date): Date => {
        let newDate: Date;
        switch (zoomLevel) {
            case 'day':
                const dayFraction = pixelOffset / columnWidth;
                const dayOffsetForDay = Math.round(dayFraction);
                newDate = addDays(referenceDate, dayOffsetForDay);
                break;
            case 'week':
                const weekFraction = pixelOffset / columnWidth;
                const dayOffsetForWeek = Math.round(weekFraction * 7);
                newDate = addDays(referenceDate, dayOffsetForWeek);
                break;
            case 'month':
                const monthFraction = pixelOffset / columnWidth;
                const dayOffsetForMonth = Math.round(monthFraction * 30);
                newDate = addDays(referenceDate, dayOffsetForMonth);
                break;
            default:
                newDate = referenceDate;
        }

        if (newDate < firstDate) return firstDate;
        if (newDate > lastDate) return lastDate;
        return newDate;
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;
        const itemId = parseInt(active.id as string, 10);
        const item = itemsWithLanes.find(item => item.id === itemId);

        if (!item || delta.x === 0) return;

        const startDate = parseISO(item.start);
        const endDate = parseISO(item.end);
        const duration = differenceInCalendarDays(endDate, startDate);

        const firstDate = timelineDates[0];
        const lastDate = timelineDates[timelineDates.length - 1];

        let newStartDate = calculateNewDate(delta.x, startDate, firstDate, lastDate);
        let newEndDate = addDays(newStartDate, duration);

        if (newEndDate >= lastDate) {
            newEndDate = lastDate;
            newStartDate = addDays(newEndDate, -duration);
            setDynamicMaxDate(expandMaxDate(currentMaxDate));
        }

        if (newStartDate <= firstDate) {
            newStartDate = firstDate;
            newEndDate = addDays(newStartDate, duration);
            setDynamicMinDate(expandMinDate(currentMinDate));
        }

        if (newStartDate < firstDate) {
            newStartDate = firstDate;
            newEndDate = addDays(newStartDate, duration);
        }

        const formattedStartDate = format(newStartDate, 'yyyy-MM-dd');
        const formattedEndDate = format(newEndDate, 'yyyy-MM-dd');

        const updatedItem = { ...item, start: formattedStartDate, end: formattedEndDate };
        const updatedItems = itemsWithLanes.map(i => i.id === itemId ? updatedItem : i);
        setItemsWithLanes(assignLanes(updatedItems));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('.timeline-item')) return;

        setIsDraggingTimeline(true);
        setStartX(e.pageX);
        setScrollLeftStart(containerRef.current?.scrollLeft || 0);
        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingTimeline || !containerRef.current) return;

        const deltaX = e.pageX - startX;
        containerRef.current.scrollLeft = scrollLeftStart - deltaX;
    };

    const handleMouseUp = () => {
        setIsDraggingTimeline(false);
    };

    useEffect(() => {
        window.addEventListener('mouseup', () => setIsDraggingTimeline(false));
        return () => window.removeEventListener('mouseup', () => setIsDraggingTimeline(false));
    }, []);

    return (
        <TimelineContainer>
            <TimelineControls>
                <ZoomButton active={zoomLevel === 'day'} onClick={() => setZoomLevel('day')}>
                    Dia
                </ZoomButton>
                <ZoomButton active={zoomLevel === 'week'} onClick={() => setZoomLevel('week')}>
                    Semana
                </ZoomButton>
                <ZoomButton active={zoomLevel === 'month'} onClick={() => setZoomLevel('month')}>
                    Mês
                </ZoomButton>
            </TimelineControls>

            <ScrollContainer
                ref={containerRef}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ cursor: isDraggingTimeline ? 'grabbing' : 'grab' }}
            >
                <TimelineHeader>
                    <DateHeaderContainer style={{ width: `${totalGridWidth}px` }}>
                        {zoomLevel === 'day' && (
                            <div className="month-row">
                                {timelineDates.map((date, index) =>
                                        shouldShowMonth(date, index) && (
                                            <div
                                                key={`month-${index}`}
                                                className="month-label"
                                                style={{ left: `${index * columnWidth}px` }}
                                            >
                                                {format(date, 'MMMM', { locale: ptBR })}
                                            </div>
                                        )
                                )}
                            </div>
                        )}
                        <div className="date-row">
                            {timelineDates.map((date, index) => (
                                <DateHeaderCell
                                    key={index}
                                    style={{
                                        width: `${columnWidth}px`,
                                        minWidth: `${columnWidth}px`,
                                        maxWidth: `${columnWidth}px`,
                                        flexShrink: 0
                                    }}
                                    isLast={index === timelineDates.length - 1}
                                    isWeekend={date.getDay() === 0 || date.getDay() === 6}
                                >
                                    {formatHeaderDate(date)}
                                    {zoomLevel === 'day' && (
                                        <span className="day-of-week">
                                            {format(date, 'EEE', { locale: ptBR })}
                                        </span>
                                    )}
                                </DateHeaderCell>
                            ))}
                        </div>
                    </DateHeaderContainer>
                </TimelineHeader>

                <TimelineBody>
                    <DndContext onDragEnd={handleDragEnd}>
                        <TimelineGrid style={{ width: `${totalGridWidth}px`, height: `${totalGridHeight}px` }}>
                            {activeLanes.map((laneId) => (
                                <div key={laneId}>
                                    {itemsWithLanes
                                        .filter(item => item.lane === laneId)
                                        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                                        .map(item => (
                                            <TimelineItem
                                                key={item.id}
                                                item={item}
                                                items={itemsWithLanes}
                                                minDate={currentMinDate}
                                                maxDate={currentMaxDate}
                                                totalWidth={totalGridWidth}
                                                maxLanes={activeLanes.length}
                                                columnWidth={columnWidth}
                                                onItemChange={handleItemChange}
                                            />
                                        ))}
                                </div>
                            ))}
                            {activeLanes.map((laneId) =>
                                timelineDates.map((date, dateIndex) => (
                                    !dateCoverage[laneId]?.[format(date, 'yyyy-MM-dd')] && (
                                        <EmptyCell
                                            key={`empty-${laneId}-${dateIndex}`}
                                            style={{
                                                top: `${laneId * 60}px`,
                                                left: `${dateIndex * columnWidth}px`,
                                                width: `${columnWidth}px`,
                                                height: `60px`
                                            }}
                                        />
                                    )
                                ))
                            )}
                            {timelineDates.map((date, index) => (
                                <VerticalGridLine
                                    key={index}
                                    style={{
                                        left: `${index * columnWidth}px`,
                                        height: `${totalGridHeight}px`
                                    }}
                                    isWeekend={date.getDay() === 0 || date.getDay() === 6}
                                    isMonthStart={date.getDate() === 1}
                                />
                            ))}
                            {activeLanes.slice(0, -1).map((laneId, index) => (
                                <HorizontalGridLine
                                    key={`hgrid-${laneId}`}
                                    style={{ top: `${(index + 1) * 60}px` }}
                                />
                            ))}
                        </TimelineGrid>
                    </DndContext>
                </TimelineBody>

                <ScrollArrows scrollContainerRef={containerRef} totalGridWidth={totalGridWidth} />
            </ScrollContainer>

            <Instructions>
                <p><strong>Instruções:</strong></p>
                <ul>
                    <li>Arraste itens horizontalmente para reposicioná-los no tempo</li>
                    <li>Redimensione itens arrastando as bordas esquerdas ou direitas</li>
                    <li>Clique duplo para editar nomes de itens</li>
                    <li>Use os botões de zoom ou role o mouse com Alt pressionado para mudar a visualização</li>
                    <li>Arraste a timeline com o mouse para navegar pelas datas</li>
                    <li>Áreas em cinza claro indicam dias sem itens programados</li>
                </ul>
            </Instructions>
        </TimelineContainer>
    );
};

export default Timeline;