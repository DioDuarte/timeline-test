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
    startOfMonth,
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
    TimelineWrapper,
    Sentinel,
    FocusIndicator,
} from './styles';
import { TimelineItem as TimelineItemType, ZoomLevel } from '../../types/types';
import { assignLanes } from '../../utils/assignLanes';
import { useTimelineConfig } from '../../context/TimelineContext';
import { getTimelineDates } from '../../utils/dateUtils';
import TimelineItem from '../TimelineItem/TimelineItem';
import ScrollArrows from '../common/ScrollArrow/ScrollArrow';
import ItemsListPanel from "../TimelinePanel/TimelinePanel";
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
    const containerRef = useRef<HTMLDivElement>(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<number | undefined>();
    const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);
    const previousDatesLengthRef = useRef<number>(0);
    const [focusTooltipText, setFocusTooltipText] = useState<string>('');

    const [focusPoint, setFocusPoint] = useState<Date | null>(null);
    const [focusIndicatorVisible, setFocusIndicatorVisible] = useState(false);
    const [focusIndicatorPosition, setFocusIndicatorPosition] = useState(0);

    const { zoomLevel, setZoomLevel, paddingDaysBefore, paddingDaysAfter } = useTimelineConfig();

    const sortedItems = [...items].sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
    const initialMinDate = sortedItems.length > 0 ? parseISO(sortedItems[0].start) : new Date();
    const initialMaxDate = sortedItems.length > 0 ? parseISO(sortedItems[sortedItems.length - 1].end) : new Date();
    const currentMinDate = dynamicMinDate || initialMinDate;
    const currentMaxDate = dynamicMaxDate || initialMaxDate;
    const timelineDates = getTimelineDates(currentMinDate, currentMaxDate, zoomLevel, paddingDaysBefore, paddingDaysAfter);

    const getFixedColumnWidth = (): number => {
        switch (zoomLevel) {
            case 'day': return 60;
            case 'week': return 180;
            case 'month': return 240;
            default: return 60;
        }
    };

    const columnWidth = getFixedColumnWidth();
    const totalGridWidth = columnWidth * timelineDates.length;

    useEffect(() => {
        setItemsWithLanes(assignLanes(items));
    }, [items]);

    // Função para obter a data exata em uma posição X
    const getDateAtPosition = (x: number): Date => {
        if (!containerRef.current) return new Date();

        const containerRect = containerRef.current.getBoundingClientRect();
        const relativeX = x - containerRect.left + containerRef.current.scrollLeft;

        const gridStartDate = addDays(currentMinDate, -paddingDaysBefore);

        switch (zoomLevel) {
            case 'day':
                const dayIndex = Math.floor(relativeX / columnWidth);
                return addDays(gridStartDate, dayIndex);

            case 'week':
                const weekIndex = Math.floor(relativeX / columnWidth);
                const weekStartDate = addWeeks(gridStartDate, weekIndex);
                // Calcular a posição relativa dentro da semana
                const positionInsideWeek = (relativeX % columnWidth) / columnWidth;
                const daysToAdd = Math.floor(positionInsideWeek * 7);
                return addDays(weekStartDate, daysToAdd);

            case 'month':
                const monthIndex = Math.floor(relativeX / columnWidth);
                const monthStartDate = addMonths(gridStartDate, monthIndex);
                // Calcular a posição relativa dentro do mês
                const daysInMonth = new Date(monthStartDate.getFullYear(), monthStartDate.getMonth() + 1, 0).getDate();
                const positionInsideMonth = (relativeX % columnWidth) / columnWidth;
                const daysToAddInMonth = Math.floor(positionInsideMonth * daysInMonth);
                return addDays(monthStartDate, daysToAddInMonth);

            default:
                return new Date();
        }
    };

    // Função para calcular a posição do indicador com precisão diária
    // Função para calcular a posição do indicador com precisão diária
    const calculateIndicatorPosition = (date: Date): number => {
        const gridStartDate = addDays(currentMinDate, -paddingDaysBefore);

        switch (zoomLevel) {
            case 'day':
                // No modo dia, cada coluna representa um dia
                // Calcular a posição e centralizar no meio da coluna do dia
                const daysFromStart = differenceInCalendarDays(date, gridStartDate);
                return (daysFromStart * columnWidth) + (columnWidth / 2);

            case 'week':
                // No modo semana, calcular qual semana e posição dentro da semana
                const startOfFirstWeek = startOfWeek(gridStartDate, { locale: ptBR, weekStartsOn: 1 });
                const totalDaysFromWeekStart = differenceInCalendarDays(date, startOfFirstWeek);
                const weekIndex = Math.floor(totalDaysFromWeekStart / 7);
                const dayInWeek = totalDaysFromWeekStart % 7;

                // Posição da semana + posição proporcional do dia dentro da semana
                return (weekIndex * columnWidth) + ((dayInWeek / 7) * columnWidth);

            case 'month':
                // No modo mês, encontrar em qual mês o dia cai e sua posição proporcional
                let currentDate = new Date(gridStartDate);
                let totalPosition = 0;
                let found = false;

                while (!found) {
                    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    const nextMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

                    // Se a data estiver neste mês
                    if (date >= currentMonthStart && date < nextMonthStart) {
                        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                        const dayOfMonth = date.getDate();
                        const proportionalPosition = (dayOfMonth - 1) / daysInMonth;

                        // Adicionar a posição proporcional do dia dentro do mês
                        totalPosition += proportionalPosition * columnWidth;
                        found = true;
                    } else {
                        // Avançar para o próximo mês
                        if (date > nextMonthStart) {
                            totalPosition += columnWidth;
                            currentDate = nextMonthStart;
                        } else {
                            // A data é anterior ao início da timeline
                            return 0;
                        }
                    }
                }

                return totalPosition;

            default:
                return 0;
        }
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('.timeline-item')) return;

        const exactDate = getDateAtPosition(e.clientX);
        setFocusPoint(exactDate);
        setFocusIndicatorVisible(true);

        const formattedDate = format(exactDate, 'dd/MM/yyyy');
        setFocusTooltipText(formattedDate);
        console.log(`Ponto focal definido: ${formattedDate}`);

        const indicatorPosition = calculateIndicatorPosition(exactDate);
        setFocusIndicatorPosition(indicatorPosition);
    };

    const expandMinDate = (currentMin: Date, steps: number = 20) => {
        switch (zoomLevel) {
            case 'day': return subDays(currentMin, steps);
            case 'week': return subWeeks(currentMin, steps - 16);
            case 'month': return subMonths(currentMin, steps - 18);
            default: return currentMin;
        }
    };

    const expandMaxDate = (currentMax: Date, steps: number = 20) => {
        switch (zoomLevel) {
            case 'day': return addDays(currentMax, steps);
            case 'week': return addWeeks(currentMax, steps);
            case 'month': return addMonths(currentMax, steps);
            default: return currentMax;
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (entry.target.id === 'sentinel-left' && containerRef.current!.scrollLeft < 100) {
                            const previousLength = timelineDates.length;
                            const newMinDate = expandMinDate(currentMinDate);
                            const newDates = getTimelineDates(newMinDate, currentMaxDate, zoomLevel, paddingDaysBefore, paddingDaysAfter);

                            // Primeiro, salvar o ponto focal atual
                            if (focusPoint && focusIndicatorVisible) {
                                // Manter a data focal e recalcular sua posição após a expansão
                                setTimeout(() => {
                                    const newPosition = calculateIndicatorPosition(focusPoint);
                                    setFocusIndicatorPosition(newPosition);
                                }, 10);
                            }

                            setDynamicMinDate(newMinDate);
                            previousDatesLengthRef.current = newDates.length;
                        } else if (entry.target.id === 'sentinel-right') {
                            const newMaxDate = expandMaxDate(currentMaxDate);
                            setDynamicMaxDate(newMaxDate);
                        }
                    }
                });
            },
            { root: containerRef.current, threshold: 0, rootMargin: '0px 0px 0px 200px' }
        );

        const leftSentinel = document.getElementById('sentinel-left');
        const rightSentinel = document.getElementById('sentinel-right');
        if (leftSentinel) observer.observe(leftSentinel);
        if (rightSentinel) observer.observe(rightSentinel);

        return () => observer.disconnect();
    }, [currentMinDate, currentMaxDate, zoomLevel, timelineDates, columnWidth, focusPoint, focusIndicatorVisible]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isItemModalOpen || (e.target as HTMLElement).closest('.timeline-item')) return;
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
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (e.altKey) {
            e.preventDefault();
            const zoomLevels: ZoomLevel[] = ['day', 'week', 'month'];
            const currentIndex = zoomLevels.indexOf(zoomLevel);
            let newIndex = currentIndex + (e.deltaY > 0 ? 1 : -1);
            newIndex = Math.max(0, Math.min(newIndex, zoomLevels.length - 1));
            const newZoomLevel = zoomLevels[newIndex];

            setZoomLevel(newZoomLevel);
            if (!focusPoint || !focusIndicatorVisible) {
                setDynamicMinDate(null);
                setDynamicMaxDate(null);
            }
        }
    };

    // Efeito para recalcular a posição do indicador quando o zoom muda
    useEffect(() => {
        if (focusPoint && containerRef.current && focusIndicatorVisible) {
            // Recalcular posição do indicador com a nova escala de zoom
            const newPosition = calculateIndicatorPosition(focusPoint);
            setFocusIndicatorPosition(newPosition);

            // Centralizar a visualização no ponto focal
            const containerWidth = containerRef.current.clientWidth;
            const targetScroll = newPosition - containerWidth / 2;

            setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTo({
                        left: Math.max(0, targetScroll),
                        behavior: 'smooth'
                    });
                }
            }, 10);
        }
    }, [zoomLevel, focusPoint, timelineDates, columnWidth, focusIndicatorVisible]);

    const handleDragEnd = (event: DragEndEvent) => {
        if (isItemModalOpen) return;
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

    const maxLane = Math.max(...itemsWithLanes.map((item) => item.lane || 0), 0);
    const activeLanes = Array.from({ length: maxLane + 1 }, (_, i) => i);
    const totalGridHeight = activeLanes.length * 60;

    const formatHeaderDate = (date: Date) => {
        switch (zoomLevel) {
            case 'day': return format(date, 'dd/MM/yy');
            case 'week': return `${format(startOfWeek(date, { locale: ptBR, weekStartsOn: 1 }), 'dd/MM')} - ${format(endOfWeek(date, { locale: ptBR, weekStartsOn: 1 }), 'dd/MM')}`;
            case 'month': return format(date, 'MMM yyyy', { locale: ptBR });
            default: return '';
        }
    };

    const scrollToItem = (item: TimelineItemType) => {
        setSelectedItemId(item.id);

        if (!containerRef.current) return;

        const { clientWidth: containerWidth, scrollLeft: currentScroll, scrollWidth: totalWidth } = containerRef.current;

        const itemStart = parseISO(item.start);
        const itemEnd = parseISO(item.end);

        const findDateIndex = (date: Date) => {
            switch (zoomLevel) {
                case 'day':
                    return timelineDates.findIndex((d) => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
                case 'week':
                    return timelineDates.findIndex((d) => {
                        const weekStart = startOfWeek(d, { locale: ptBR, weekStartsOn: 1 });
                        const itemWeekStart = startOfWeek(date, { locale: ptBR, weekStartsOn: 1 });
                        return format(weekStart, 'yyyy-MM-dd') === format(itemWeekStart, 'yyyy-MM-dd');
                    });
                case 'month':
                    return timelineDates.findIndex((d) => format(d, 'yyyy-MM') === format(date, 'yyyy-MM'));
                default:
                    return -1;
            }
        };

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
            behavior
        });
    };

    return (
        <TimelineWrapper>
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
                    <button
                        onClick={() => setFocusIndicatorVisible(false)}
                        disabled={!focusIndicatorVisible}
                        style={{
                            marginLeft: 'auto',
                            opacity: focusIndicatorVisible ? 1 : 0.5,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            cursor: focusIndicatorVisible ? 'pointer' : 'default'
                        }}
                    >
                        Remover Ponto de Referência
                    </button>
                </TimelineControls>

                <ScrollContainer
                    ref={containerRef}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onDoubleClick={handleDoubleClick}
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
                                <Sentinel id="sentinel-left" style={{
                                    left: '0px',
                                    width: '50px',
                                    height: `${totalGridHeight}px`
                                }} />

                                {focusIndicatorVisible && (
                                    <FocusIndicator
                                        left={focusIndicatorPosition}
                                        isActive={focusIndicatorVisible}
                                    />
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
                                <Sentinel id="sentinel-right" style={{
                                    left: `${totalGridWidth - 50}px`,
                                    width: '50px',
                                    height: `${totalGridHeight}px`
                                }} />
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
                        <li>Clique duplo em qualquer data para criar um ponto de referência para zoom</li>
                    </ul>
                </Instructions>
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