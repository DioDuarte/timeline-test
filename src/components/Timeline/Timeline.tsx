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


    // Estados para o ponto focal
    const [focusPoint, setFocusPoint] = useState<Date | null>(null);
    const [focusIndicatorVisible, setFocusIndicatorVisible] = useState(false);
    const [focusIndicatorPosition, setFocusIndicatorPosition] = useState(0);

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
            case 'day': return 60;
            case 'week': return 180;
            case 'month': return 240;
            default: return 60;
        }
    };

    const columnWidth = getFixedColumnWidth();
    const totalGridWidth = columnWidth * timelineDates.length;

    // Atribuir lanes aos itens
    useEffect(() => {
        setItemsWithLanes(assignLanes(items));
    }, [items]);

    // Função para identificar a data na posição do clique
    // Função para identificar a data na posição do clique com precisão proporcional
    const getDateAtPosition = (x: number): Date => {
        if (!containerRef.current) return new Date();

        const containerRect = containerRef.current.getBoundingClientRect();
        const relativeX = x - containerRect.left + containerRef.current.scrollLeft;

        switch (zoomLevel) {
            case 'day':
                const dayColumnIndex = Math.floor(relativeX / columnWidth);
                const safeDayIndex = Math.max(0, Math.min(dayColumnIndex, timelineDates.length - 1));
                return timelineDates[safeDayIndex];

            case 'week':
                const weekColumnIndex = Math.floor(relativeX / columnWidth);
                const safeWeekIndex = Math.max(0, Math.min(weekColumnIndex, timelineDates.length - 1));
                const weekStartDate = startOfWeek(timelineDates[safeWeekIndex], { weekStartsOn: 1 });

                const positionInWeek = relativeX - (weekColumnIndex * columnWidth);
                const proportionInWeek = positionInWeek / columnWidth;
                const dayOfWeekFloat = proportionInWeek * 7;
                const dayOfWeek = Math.floor(dayOfWeekFloat);
                return addDays(weekStartDate, Math.min(dayOfWeek, 6));

            case 'month':
                const monthColumnIndex = Math.floor(relativeX / columnWidth);
                const safeMonthIndex = Math.max(0, Math.min(monthColumnIndex, timelineDates.length - 1));
                const monthStartDate = startOfMonth(timelineDates[safeMonthIndex]);
                const daysInMonth = new Date(
                    monthStartDate.getFullYear(),
                    monthStartDate.getMonth() + 1,
                    0
                ).getDate();

                const positionInMonth = relativeX - (monthColumnIndex * columnWidth);
                const proportionInMonth = positionInMonth / columnWidth;
                const dayOfMonthFloat = proportionInMonth * daysInMonth;
                const dayOfMonth = Math.floor(dayOfMonthFloat) + 1;
                return new Date(
                    monthStartDate.getFullYear(),
                    monthStartDate.getMonth(),
                    Math.min(dayOfMonth, daysInMonth)
                );

            default:
                return new Date();
        }
    };


    // Função para calcular a posição exata do indicador, independente do zoom
    const calculateFocusIndicatorPosition = (date: Date): number => {
        if (!date) return 0;

        let position = 0;

        switch (zoomLevel) {
            case 'day':
                const dayIndex = timelineDates.findIndex(d =>
                    format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                );
                position = dayIndex >= 0 ? dayIndex * columnWidth + columnWidth / 2 : 0;
                break;

            case 'week':
                const weekStartDate = startOfWeek(date, { weekStartsOn: 1 });
                const weekIndex = timelineDates.findIndex(d =>
                    format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd') ===
                    format(weekStartDate, 'yyyy-MM-dd')
                );

                if (weekIndex >= 0) {
                    const dayInWeek = differenceInCalendarDays(date, weekStartDate);
                    position = weekIndex * columnWidth + (dayInWeek / 7) * columnWidth;
                }
                break;

            case 'month':
                const monthStart = startOfMonth(date);
                const monthIndex = timelineDates.findIndex(d =>
                    format(d, 'yyyy-MM') === format(date, 'yyyy-MM')
                );

                if (monthIndex >= 0) {
                    const dayOfMonth = date.getDate() - 1;
                    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                    position = monthIndex * columnWidth + (dayOfMonth / daysInMonth) * columnWidth;
                }
                break;
        }

        return position;
    };

// Handler para duplo clique para definir ponto focal
    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('.timeline-item')) return;

        const exactDate = getDateAtPosition(e.clientX);
        setFocusPoint(exactDate);
        setFocusIndicatorVisible(true);

        const formattedDate = format(exactDate, 'dd/MM/yyyy');
        const dayName = format(exactDate, 'EEEE', { locale: ptBR });
        setFocusTooltipText(`${formattedDate} (${dayName})`);

        const indicatorPosition = calculateFocusIndicatorPosition(exactDate);
        setFocusIndicatorPosition(indicatorPosition);
    };

    // Funções de expansão
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



    // Configurar o IntersectionObserver para lazy loading
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
                            const addedColumns = newDates.length - previousLength;
                            const scrollAdjustment = addedColumns * columnWidth;

                            // Recalcular a posição do indicador focal após a expansão
                            if (focusPoint && focusIndicatorVisible) {
                                setFocusIndicatorPosition(prevPosition => prevPosition + scrollAdjustment);
                            }

                            // Ajustar o scroll antes de atualizar o estado
                            containerRef.current!.scrollLeft += scrollAdjustment;
                            setDynamicMinDate(newMinDate);
                            previousDatesLengthRef.current = newDates.length;
                        } else if (entry.target.id === 'sentinel-right') {
                            const newMaxDate = expandMaxDate(currentMaxDate);
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
    }, [currentMinDate, currentMaxDate, zoomLevel, timelineDates, columnWidth, focusPoint, focusIndicatorVisible]);

    // Manipulação de eventos de arrastar
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

    // Manipulação de zoom com roda do mouse
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (e.altKey) {
            e.preventDefault();
            const zoomLevels: ZoomLevel[] = ['day', 'week', 'month'];
            const currentIndex = zoomLevels.indexOf(zoomLevel);
            let newIndex = currentIndex + (e.deltaY > 0 ? 1 : -1);
            newIndex = Math.max(0, Math.min(newIndex, zoomLevels.length - 1));
            const newZoomLevel = zoomLevels[newIndex];

            if (focusPoint && focusIndicatorVisible && containerRef.current) {
                // Salvar ponto focal atual antes de mudar o zoom
                setZoomLevel(newZoomLevel);
            } else {
                // Comportamento padrão sem ponto focal
                setZoomLevel(newZoomLevel);
                setDynamicMinDate(null);
                setDynamicMaxDate(null);
            }
        }
    };

    // Efeito para recentralizar após mudança de zoom
    useEffect(() => {
        if (focusPoint && containerRef.current && focusIndicatorVisible) {
            const newPosition = calculateFocusIndicatorPosition(focusPoint);
            setFocusIndicatorPosition(newPosition);

            const containerWidth = containerRef.current.clientWidth;
            const targetScroll = newPosition - containerWidth / 2;

            setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTo({
                        left: Math.max(0, targetScroll),
                        behavior: 'smooth'
                    });
                }
            }, 0);
        }
    }, [zoomLevel, focusPoint, timelineDates, columnWidth, focusIndicatorVisible]);


    // Manipulação de arrastar itens
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

    // Renderização
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

                                {/* Indicador de Ponto Focal */}
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
                                            boxShadow: '0 0 8px rgba(255, 107, 107, 0.8)'
                                        }}
                                    >
                                        {/* Tooltip com a data exata */}
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
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {focusTooltipText}
                                        </div>

                                        {/* Marcador circular */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '-10px',
                                                left: '-5px',
                                                width: '12px',
                                                height: '12px',
                                                backgroundColor: '#ff6b6b',
                                                borderRadius: '50%',
                                                boxShadow: '0 0 8px rgba(255, 107, 107, 0.8)'
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