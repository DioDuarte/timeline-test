import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    TimelineContainer,
    ScrollContainer,
    TimelineBody,
    TimelineWrapper,
} from './styles';
import { TimelineItem as TimelineItemType } from '../../types/types';
import { assignLanes } from '../../utils/assignLanes';
import { useTimelineConfig } from '../../context/TimelineContext';
import {
    calculateFocusIndicatorPosition,
    expandMaxDate,
    expandMinDate,
    getDateAtPosition,
    getTimelineDates
} from '../../utils/dateUtils';
import { formatDetailedDate } from '../../utils/formatUtils';
import ScrollArrows from '../common/ScrollArrow/ScrollArrow';
import ItemsListPanel from "../TimelinePanel/TimelinePanel";
import { DragEndEvent } from '@dnd-kit/core';
import { useZoomControl } from "../../hooks/useZoomControl";
import { useDragScroll } from "../../hooks/useDragScroll";
import { getFixedColumnWidth, handleItemDragEnd } from "../../utils/timelineUtils";
import TimelineControlsComponent from "./TimelineControls";
import TimelineHeaderComponent from "./TimeLineHeader";
import TimelineGridComponent from "./TimelineGrid";
import TimelineInstructions from "./TimelineInstructions";

interface TimelineProps {
    items: TimelineItemType[];
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
    // ==========================================
    // 1. Estados e Referências
    // ==========================================
    const { zoomLevel, setZoomLevel, paddingDaysBefore, paddingDaysAfter } = useTimelineConfig();
    const containerRef = useRef<HTMLDivElement>(null);
    const previousDatesLengthRef = useRef<number>(0);

    // Estados para itens e datas
    const [itemsWithLanes, setItemsWithLanes] = useState<TimelineItemType[]>([]);
    const [dynamicMinDate, setDynamicMinDate] = useState<Date | null>(null);
    const [dynamicMaxDate, setDynamicMaxDate] = useState<Date | null>(null);

    // Estados para interatividade
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<number | undefined>();
    const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);

    // Estados para o ponto focal
    const [focusPoint, setFocusPoint] = useState<Date | null>(null);
    const [focusIndicatorVisible, setFocusIndicatorVisible] = useState(false);
    const [focusIndicatorPosition, setFocusIndicatorPosition] = useState(0);
    const [focusTooltipText, setFocusTooltipText] = useState<string>('');

    // Hooks customizados
    const { isDragging, setIsDragging, handleMouseDown, handleMouseMove } = useDragScroll(containerRef);
    const { handleWheel } = useZoomControl(zoomLevel, setZoomLevel, () => {
        setDynamicMinDate(null);
        setDynamicMaxDate(null);
    });

    // ==========================================
    // 2. Constantes e Variáveis Derivadas
    // ==========================================
    const sortedItems = [...items].sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
    const initialMinDate = sortedItems.length > 0 ? parseISO(sortedItems[0].start) : new Date();
    const initialMaxDate = sortedItems.length > 0 ? parseISO(sortedItems[sortedItems.length - 1].end) : new Date();
    const currentMinDate = dynamicMinDate || initialMinDate;
    const currentMaxDate = dynamicMaxDate || initialMaxDate;
    const timelineDates = getTimelineDates(currentMinDate, currentMaxDate, zoomLevel, paddingDaysBefore, paddingDaysAfter);
    const columnWidth = getFixedColumnWidth(zoomLevel);
    const totalGridWidth = columnWidth * timelineDates.length;

    // Cálculos de altura da grid
    const maxLane = Math.max(...itemsWithLanes.map((item) => item.lane || 0), 0);
    const activeLanes = Array.from({ length: maxLane + 1 }, (_, i) => i);
    const totalGridHeight = activeLanes.length * 60;

    // ==========================================
    // 3. Manipuladores de Eventos
    // ==========================================

    // Manipular duplo clique para definir/remover ponto focal
    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('.timeline-item')) return;

        // Remover ponto focal se o clique for perto dele
        if (focusIndicatorVisible && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const clickPosition = e.clientX - containerRect.left + containerRef.current.scrollLeft;
            const tolerance = 10;

            if (Math.abs(clickPosition - focusIndicatorPosition) <= tolerance) {
                setFocusIndicatorVisible(false);
                return;
            }
        }

        // Criar novo ponto focal
        const exactDate = getDateAtPosition(e.clientX, timelineDates, columnWidth, zoomLevel, containerRef);
        setFocusPoint(exactDate);
        setFocusIndicatorVisible(true);
        setFocusTooltipText(formatDetailedDate(exactDate));
        setFocusIndicatorPosition(calculateFocusIndicatorPosition(exactDate, timelineDates, zoomLevel, columnWidth));
    };

    // Finalizar arrasto quando soltar o mouse
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Manipular fim de arrasto de item
    const handleDragEnd = (event: DragEndEvent) => {
        if (isItemModalOpen) return;
        handleItemDragEnd(event, itemsWithLanes, timelineDates, columnWidth, zoomLevel, setItemsWithLanes, (start, end) => {
            if (end > currentMaxDate) setDynamicMaxDate(expandMaxDate(currentMaxDate, zoomLevel));
            if (start < currentMinDate) setDynamicMinDate(expandMinDate(currentMinDate, zoomLevel));
        });
    };

    // ==========================================
    // 4. Funções Auxiliares
    // ==========================================

    // Localizar índice de uma data na timeline
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

    // Rolar para um item específico
    const scrollToItem = (item: TimelineItemType) => {
        setSelectedItemId(item.id);

        if (!containerRef.current) return;

        const { clientWidth: containerWidth, scrollLeft: currentScroll, scrollWidth: totalWidth } = containerRef.current;

        const itemStart = parseISO(item.start);
        const itemEnd = parseISO(item.end);

        const startIndex = findDateIndex(itemStart);
        const endIndex = findDateIndex(itemEnd);

        // Se o item não estiver visível na timeline atual, ajustar as datas
        if (startIndex === -1 || endIndex === -1) {
            const newMinDate = itemStart < timelineDates[0] ? itemStart : timelineDates[0];
            const newMaxDate = itemEnd > timelineDates[timelineDates.length - 1] ? itemEnd : timelineDates[timelineDates.length - 1];
            setDynamicMinDate(newMinDate);
            setDynamicMaxDate(newMaxDate);
            return;
        }

        // Calcular posição e centralizar item na viewport
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

    // ==========================================
    // 5. Efeitos Secundários
    // ==========================================

    // Atribuir lanes aos itens
    useEffect(() => {
        setItemsWithLanes(assignLanes(items));
    }, [items]);

    // Configurar IntersectionObserver para lazy loading
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

                            // Recalcular posição do indicador focal após expansão
                            if (focusPoint && focusIndicatorVisible) {
                                setFocusIndicatorPosition(prevPosition => prevPosition + scrollAdjustment);
                            }

                            // Ajustar scroll antes de atualizar o estado
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
    }, [currentMinDate, currentMaxDate, zoomLevel, timelineDates, columnWidth, focusPoint, focusIndicatorVisible]);

    // Adicionar listener global para mouseup
    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    // Recentralizar após mudança de zoom
    useEffect(() => {
        if (focusPoint && containerRef.current && focusIndicatorVisible) {
            const newPosition = calculateFocusIndicatorPosition(focusPoint, timelineDates, zoomLevel, columnWidth);
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

    // ==========================================
    // 6. Renderização
    // ==========================================
    return (
        <TimelineWrapper>
            <TimelineContainer>
                <TimelineControlsComponent
                    zoomLevel={zoomLevel}
                    setZoomLevel={setZoomLevel}
                    focusIndicatorVisible={focusIndicatorVisible}
                    onRemoveFocus={() => setFocusIndicatorVisible(false)}
                />

                <ScrollContainer
                    ref={containerRef}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onDoubleClick={handleDoubleClick}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                    <TimelineHeaderComponent
                        timelineDates={timelineDates}
                        zoomLevel={zoomLevel}
                        columnWidth={columnWidth}
                    />

                    <TimelineBody>
                        <TimelineGridComponent
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
                            focusIndicatorVisible={focusIndicatorVisible}
                            focusIndicatorPosition={focusIndicatorPosition}
                            focusTooltipText={focusTooltipText}
                            onDragEnd={handleDragEnd}
                        />
                    </TimelineBody>

                    <ScrollArrows
                        scrollContainerRef={containerRef}
                        totalGridWidth={totalGridWidth}
                    />
                </ScrollContainer>
                <TimelineInstructions/>
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