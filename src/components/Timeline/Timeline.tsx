import React, { useState, useEffect, useRef } from 'react';
import {
    differenceInCalendarDays,
    format,
    parseISO,
    addDays,
    addWeeks,
    addMonths,
    startOfWeek,
    endOfWeek,
    subDays,
    subWeeks,
    subMonths,
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
} from './styles';
import { TimelineItem as TimelineItemType, ZoomLevel } from '../../types/types';
import { assignLanes } from '../../utils/assignLanes';
import { useTimelineConfig } from '../../context/TimelineContext';
import { getTimelineDates } from '../../utils/dateUtils';
import TimelineItem from '../TimelineItem/TimelineItem';
import ScrollArrows from '../common/ScrollArrow/ScrollArrow';
import { DndContext, DragEndEvent } from '@dnd-kit/core';

interface TimelineProps {
    items: TimelineItemType[];
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
    const [itemsWithLanes, setItemsWithLanes] = useState<TimelineItemType[]>([]);
    const [dynamicMinDate, setDynamicMinDate] = useState<Date | null>(null);
    const [dynamicMaxDate, setDynamicMaxDate] = useState<Date | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftStart, setScrollLeftStart] = useState(0);
    const [lastMinExpansion, setLastMinExpansion] = useState<Date | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { zoomLevel, setZoomLevel, paddingDaysBefore, paddingDaysAfter } = useTimelineConfig();

    // Ordenar itens e definir datas iniciais
    const sortedItems = [...items].sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
    const initialMinDate = sortedItems.length > 0 ? parseISO(sortedItems[0].start) : new Date();
    const initialMaxDate = sortedItems.length > 0 ? parseISO(sortedItems[sortedItems.length - 1].end) : new Date();
    const currentMinDate = dynamicMinDate || initialMinDate;
    const currentMaxDate = dynamicMaxDate || initialMaxDate;
    const timelineDates = getTimelineDates(currentMinDate, currentMaxDate, zoomLevel, paddingDaysBefore, paddingDaysAfter);

    // Definir largura fixa das colunas com base no nível de zoom
    const getFixedColumnWidth = (): number => {
        switch (zoomLevel) {
            case 'day': return 60;   // Largura fixa para dias
            case 'week': return 180; // Largura fixa para semanas (2x o dia)
            case 'month': return 240; // Largura fixa para meses (4x o dia)
            default: return 60;
        }
    };

    const columnWidth = getFixedColumnWidth();
    const totalGridWidth = columnWidth * timelineDates.length;

    // Atribuir lanes aos itens
    useEffect(() => {
        setItemsWithLanes(assignLanes(items));
    }, [items]);

    // Funções de expansão de datas (incremental)
    const expandMinDate = (currentMin: Date) => {
        switch (zoomLevel) {
            case 'day': return subDays(currentMin, 1);
            case 'week': return subWeeks(currentMin, 1);
            case 'month': return subMonths(currentMin, 1);
            default: return currentMin;
        }
    };

    const expandMaxDate = (currentMax: Date) => {
        switch (zoomLevel) {
            case 'day': return addDays(currentMax, 1);
            case 'week': return addWeeks(currentMax, 1);
            case 'month': return addMonths(currentMax, 1);
            default: return currentMax;
        }
    };

    // Ajustar scroll após expansão de minDate
    useEffect(() => {
        if (!isDragging || !containerRef.current || !dynamicMinDate || dynamicMinDate === lastMinExpansion) return;

        const currentScrollLeft = containerRef.current.scrollLeft;
        const previousDatesLength = timelineDates.length;
        const newTimelineDates = getTimelineDates(dynamicMinDate, currentMaxDate, zoomLevel, paddingDaysBefore, paddingDaysAfter);
        const addedColumns = newTimelineDates.length - previousDatesLength;

        if (currentScrollLeft < 10 && addedColumns > 0) {
            const scrollAdjustment = addedColumns * columnWidth;
            containerRef.current.scrollLeft += scrollAdjustment;
            setLastMinExpansion(dynamicMinDate);
        }
    }, [dynamicMinDate, isDragging, timelineDates.length]);

    // Manipulação de eventos de arrastar
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('.timeline-item')) return;
        setIsDragging(true);
        setStartX(e.pageX);
        setScrollLeftStart(containerRef.current?.scrollLeft || 0);
        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !containerRef.current) return;

        const deltaX = e.pageX - startX;
        const newScrollLeft = scrollLeftStart - deltaX;
        containerRef.current.scrollLeft = newScrollLeft;

        const totalWidth = timelineDates.length * columnWidth;

        // Expansão à esquerda (passado)
        if (newScrollLeft < 10 && dynamicMinDate !== lastMinExpansion) {
            setDynamicMinDate(expandMinDate(currentMinDate));
        }

        // Expansão à direita (futuro)
        if (newScrollLeft + containerRef.current.clientWidth > totalWidth - 10) {
            setDynamicMaxDate(expandMaxDate(currentMaxDate));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setLastMinExpansion(null);
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    // Manipulação de zoom com roda do mouse
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

    // Manipulação de arrastar itens
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;
        const itemId = parseInt(active.id as string, 10);
        const item = itemsWithLanes.find((i) => i.id === itemId);

        if (!item || delta.x === 0) return;

        const startDate = parseISO(item.start);
        const endDate = parseISO(item.end);
        const duration = differenceInCalendarDays(endDate, startDate);

        const firstDate = timelineDates[0];
        const lastDate = timelineDates[timelineDates.length - 1];

        const calculateNewDate = (pixelOffset: number, referenceDate: Date) => {
            let newDate: Date;
            switch (zoomLevel) {
                case 'day':
                    newDate = addDays(referenceDate, Math.round(pixelOffset / columnWidth));
                    break;
                case 'week':
                    newDate = addDays(referenceDate, Math.round((pixelOffset / columnWidth) * 7));
                    break;
                case 'month':
                    newDate = addDays(referenceDate, Math.round((pixelOffset / columnWidth) * 30));
                    break;
                default:
                    newDate = referenceDate;
            }
            return newDate < firstDate ? firstDate : newDate > lastDate ? lastDate : newDate;
        };

        const newStartDate = calculateNewDate(delta.x, startDate);
        const newEndDate = addDays(newStartDate, duration);

        if (newEndDate > lastDate) setDynamicMaxDate(expandMaxDate(currentMaxDate));
        if (newStartDate < firstDate) setDynamicMinDate(expandMinDate(currentMinDate));

        const updatedItem = { ...item, start: format(newStartDate, 'yyyy-MM-dd'), end: format(newEndDate, 'yyyy-MM-dd') };
        const updatedItems = itemsWithLanes.map((i) => (i.id === itemId ? updatedItem : i));
        setItemsWithLanes(assignLanes(updatedItems));
    };

    // Renderização
    const maxLane = Math.max(...itemsWithLanes.map((item) => item.lane || 0), 0);
    const activeLanes = Array.from({ length: maxLane + 1 }, (_, i) => i);
    const totalGridHeight = activeLanes.length * 60;

    const formatHeaderDate = (date: Date) => {
        switch (zoomLevel) {
            case 'day': return format(date, 'd');
            case 'week': return `${format(startOfWeek(date, { locale: ptBR, weekStartsOn: 1 }), 'dd/MM')} - ${format(endOfWeek(date, { locale: ptBR, weekStartsOn: 1 }), 'dd/MM')}`;
            case 'month': return format(date, 'MMM yyyy', { locale: ptBR });
            default: return '';
        }
    };

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
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                <TimelineHeader style={{ width: `${totalGridWidth}px` }}>
                    <DateHeaderContainer>
                        <div className="date-row">
                            {timelineDates.map((date, index) => (
                                <DateHeaderCell
                                    key={index}
                                    style={{ width: `${columnWidth}px`, minWidth: `${columnWidth}px`, maxWidth: `${columnWidth}px` }}
                                    isLast={index === timelineDates.length - 1}
                                    isWeekend={date.getDay() === 0 || date.getDay() === 6}
                                >
                                    {formatHeaderDate(date)}
                                    {zoomLevel === 'day' && (
                                        <span className="day-of-week">{format(date, 'EEE', { locale: ptBR })}</span>
                                    )}
                                </DateHeaderCell>
                            ))}
                        </div>
                    </DateHeaderContainer>
                </TimelineHeader>

                <TimelineBody>
                    <DndContext onDragEnd={handleDragEnd}>
                        <TimelineGrid style={{ width: `${totalGridWidth}px`, minHeight: `${totalGridHeight}px` }}>
                            {activeLanes.map((laneId) =>
                                itemsWithLanes
                                    .filter((item) => item.lane === laneId)
                                    .map((item) => (
                                        <TimelineItem
                                            key={item.id}
                                            item={item}
                                            items={itemsWithLanes}
                                            minDate={currentMinDate}
                                            maxDate={currentMaxDate}
                                            totalWidth={totalGridWidth}
                                            columnWidth={columnWidth}
                                            maxLanes={activeLanes.length}
                                            onItemChange={setItemsWithLanes}
                                        />
                                    ))
                            )}
                            {timelineDates.map((date, dateIndex) => (
                                <VerticalGridLine
                                    key={dateIndex}
                                    style={{
                                        left: `${dateIndex * columnWidth}px`,
                                        height: `${totalGridHeight}px`,
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
                    <li>Arraste a timeline com o mouse para navegar pelas datas</li>
                    <li>Use os botões de zoom ou role o mouse com Alt pressionado para mudar a visualização</li>
                </ul>
            </Instructions>
        </TimelineContainer>
    );
};

export default Timeline;