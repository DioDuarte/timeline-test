import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { differenceInCalendarDays, endOfWeek, format, parseISO, startOfDay, startOfWeek, addDays, subDays, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    TimelineContainer,
    TimelineControls,
    ZoomButton,
    ScrollContainer,
    TimelineHeader,
    HeaderLabel,
    DateHeaderContainer,
    DateHeaderCell,
    TimelineBody,
    LanesColumn,
    LaneLabel,
    TimelineGrid,
    VerticalGridLine,
    HorizontalGridLine,
    Instructions,
    LaneNameInput,
    LaneActions,
    EditButton,
    SaveButton,
    CancelButton,
    EmptyCell,
    CursorNavigationControls,
    CursorNavigationButton,
    CursorIndicator
} from './styles';
import { TimelineItem as TimelineItemType, ZoomLevel } from '../../types/types';
import { assignLanes } from '../../utils/assignLanes';
import { useTimelineConfig } from '../../context/TimelineContext';
import { getDateRange, getTimelineDates } from '../../utils/dateUtils';
import TimelineItem from '../TimelineItem/TimelineItem';
import { DndContext, DragEndEvent } from '@dnd-kit/core';

interface TimelineProps {
    items: TimelineItemType[];
}

interface Lane {
    id: number;
    name: string;
}

interface DateCoverage {
    [laneId: number]: {
        [dateStr: string]: boolean;
    };
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
    const [itemsWithLanes, setItemsWithLanes] = useState<TimelineItemType[]>([]);
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Estado para controle do cursor
    const [cursorPosition, setCursorPosition] = useState<number>(0);
    const [initialCursorPosition, setInitialCursorPosition] = useState<number>(0);

    // Estado para controlar range de datas visível
    const [visibleMinDate, setVisibleMinDate] = useState<Date | null>(null);
    const [visibleMaxDate, setVisibleMaxDate] = useState<Date | null>(null);
    const [timelineDates, setTimelineDates] = useState<Date[]>([]);
    const [initialMinDate, setInitialMinDate] = useState<Date | null>(null);
    const [initialMaxDate, setInitialMaxDate] = useState<Date | null>(null);

    // Estado para gerenciar nomes das lanes
    const [lanes, setLanes] = useState<Lane[]>([]);
    const [editingLane, setEditingLane] = useState<number | null>(null);
    const [newLaneName, setNewLaneName] = useState('');

    const { zoomLevel, setZoomLevel, paddingDaysBefore, paddingDaysAfter, minDate: contextMinDate, maxDate: contextMaxDate, setMinDate: setContextMinDate, setMaxDate: setContextMaxDate } = useTimelineConfig();

    // Calculate initial date range
    const dateRange = useMemo(() => getDateRange(items), [items]);

    // Inicializa as datas visíveis
    useEffect(() => {
        if (!visibleMinDate || !visibleMaxDate) {
            const { minDate, maxDate } = dateRange;

            setVisibleMinDate(minDate);
            setVisibleMaxDate(maxDate);
            setInitialMinDate(minDate);
            setInitialMaxDate(maxDate);
            setContextMinDate(minDate);
            setContextMaxDate(maxDate);

            // Inicializa timeline dates
            const initialDates = getTimelineDates(minDate, maxDate, zoomLevel, paddingDaysBefore, paddingDaysAfter);
            setTimelineDates(initialDates);
        }
    }, [dateRange, zoomLevel, paddingDaysBefore, paddingDaysAfter, setContextMinDate, setContextMaxDate, visibleMinDate, visibleMaxDate]);

    // Update container width on resize
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                const lanesColumnWidth = containerRef.current.querySelector('.lanes-column')?.clientWidth || 100;
                const newWidth = containerRef.current.clientWidth - lanesColumnWidth;
                setContainerWidth(newWidth);
            }
        };

        window.addEventListener('resize', updateWidth);
        updateWidth();

        return () => window.removeEventListener('resize', updateWidth);
    }, [timelineDates.length, zoomLevel, itemsWithLanes.length]);

    // Assign lanes to items
    useEffect(() => {
        const newItemsWithLanes = assignLanes(items);
        setItemsWithLanes(newItemsWithLanes);

        const maxLaneFromItems = Math.max(...newItemsWithLanes.map(item => item.lane || 0), 0);
        if (lanes.length === 0 && maxLaneFromItems >= 0) {
            const initialLanes = Array.from({ length: maxLaneFromItems + 1 }, (_, i) => ({
                id: i,
                name: `Lane ${i + 1}`
            }));
            setLanes(initialLanes);
        }
    }, [items]);

    // Função para adicionar mais datas quando o cursor se aproxima das extremidades
    const extendTimelineDates = useCallback((direction: 'before' | 'after') => {
        if (!visibleMinDate || !visibleMaxDate) return;

        const datesToAdd = 30; // Número de datas para adicionar em cada direção
        let newDates: Date[] = [];

        if (direction === 'before') {
            // Adiciona datas antes do intervalo atual
            const newMinDate = subDays(visibleMinDate, datesToAdd);
            setVisibleMinDate(newMinDate);
            setContextMinDate(newMinDate);

            for (let i = datesToAdd; i > 0; i--) {
                newDates.push(subDays(visibleMinDate, i));
            }

            setTimelineDates(prevDates => [...newDates, ...prevDates]);

            // Ajusta a posição do cursor para manter a visualização consistente
            setCursorPosition(prev => prev + datesToAdd * getColumnWidth());
        } else {
            // Adiciona datas após o intervalo atual
            const newMaxDate = addDays(visibleMaxDate, datesToAdd);
            setVisibleMaxDate(newMaxDate);
            setContextMaxDate(newMaxDate);

            for (let i = 1; i <= datesToAdd; i++) {
                newDates.push(addDays(visibleMaxDate, i));
            }

            setTimelineDates(prevDates => [...prevDates, ...newDates]);
        }
    }, [visibleMinDate, visibleMaxDate, setContextMinDate, setContextMaxDate, getColumnWidth]);

    // Função para mover o cursor
    const moveCursor = useCallback((direction: 'left' | 'right' | 'reset') => {
        if (direction === 'reset') {
            // Volta o cursor para a posição inicial
            setCursorPosition(initialCursorPosition);

            if (initialMinDate && initialMaxDate) {
                setVisibleMinDate(initialMinDate);
                setVisibleMaxDate(initialMaxDate);
                setContextMinDate(initialMinDate);
                setContextMaxDate(initialMaxDate);

                const initialDates = getTimelineDates(initialMinDate, initialMaxDate, zoomLevel, paddingDaysBefore, paddingDaysAfter);
                setTimelineDates(initialDates);
            }

            return;
        }

        // Calcula o movimento do cursor (50% da largura visível)
        const moveAmount = containerWidth * 0.25;
        const newPosition = direction === 'left'
            ? cursorPosition - moveAmount
            : cursorPosition + moveAmount;

        setCursorPosition(newPosition);

        // Calcula a posição relativa do cursor na timeline
        const totalWidth = getColumnWidth() * timelineDates.length;
        const cursorRelativePos = newPosition / totalWidth;

        // Se o cursor estiver próximo das extremidades, estende a timeline
        if (cursorRelativePos < 0.2) {
            extendTimelineDates('before');
        } else if (cursorRelativePos > 0.8) {
            extendTimelineDates('after');
        }

        // Se o cursor não estiver visível, centralize-o
        if (containerRef.current) {
            const scrollContainer = containerRef.current;
            const cursorPos = newPosition;

            if (cursorPos < scrollContainer.scrollLeft ||
                cursorPos > (scrollContainer.scrollLeft + scrollContainer.clientWidth)) {
                scrollContainer.scrollLeft = cursorPos - (scrollContainer.clientWidth / 2);
            }
        }
    }, [
        cursorPosition,
        initialCursorPosition,
        initialMinDate,
        initialMaxDate,
        containerWidth,
        timelineDates.length,
        getColumnWidth,
        extendTimelineDates,
        zoomLevel,
        paddingDaysBefore,
        paddingDaysAfter,
        setContextMinDate,
        setContextMaxDate
    ]);

    // Inicializa a posição do cursor
    useEffect(() => {
        if (initialCursorPosition === 0 && containerWidth > 0) {
            // Posiciona o cursor no centro da visualização inicialmente
            const centerPosition = containerWidth / 2;
            setCursorPosition(centerPosition);
            setInitialCursorPosition(centerPosition);

            // Scroll para centralizar o cursor
            if (containerRef.current) {
                containerRef.current.scrollLeft = centerPosition - (containerWidth / 2);
            }
        }
    }, [containerWidth, initialCursorPosition]);

    // Handle zoom on scroll
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (e.altKey) {
            e.preventDefault();
            const zoomLevels: ZoomLevel[] = ['day', 'week', 'month'];
            const currentIndex = zoomLevels.indexOf(zoomLevel);
            let newIndex = currentIndex + (e.deltaY > 0 ? 1 : -1);
            newIndex = Math.max(0, Math.min(newIndex, zoomLevels.length - 1));
            const newZoomLevel = zoomLevels[newIndex];
            if (newZoomLevel !== zoomLevel) {
                setZoomLevel(newZoomLevel);

                // Recalcular as datas da timeline com o novo nível de zoom
                if (visibleMinDate && visibleMaxDate) {
                    const newDates = getTimelineDates(visibleMinDate, visibleMaxDate, newZoomLevel, paddingDaysBefore, paddingDaysAfter);
                    setTimelineDates(newDates);
                }
            }
        }
    };

    // Handle item changes
    const handleItemChange = (updatedItems: TimelineItemType[]) => {
        // Se updatedItems contém apenas um item, mesclar com a lista existente
        if (updatedItems.length === 1) {
            const updatedItem = updatedItems[0];
            const newItemsWithLanes = itemsWithLanes.map(i =>
                i.id === updatedItem.id ? updatedItem : i
            );
            setItemsWithLanes(assignLanes(newItemsWithLanes));
        } else {
            // Caso receba a lista completa
            const newItemsWithLanes = assignLanes(updatedItems);
            setItemsWithLanes(newItemsWithLanes);
        }
    };

    // Funções de edição de lane
    const handleEditLane = (laneId: number) => {
        setEditingLane(laneId);
        const lane = lanes.find(l => l.id === laneId);
        if (lane) {
            setNewLaneName(lane.name);
        }
    };

    const handleSaveLaneName = (laneId: number) => {
        setLanes(lanes.map(lane =>
            lane.id === laneId ? { ...lane, name: newLaneName } : lane
        ));
        setEditingLane(null);
    };

    const handleCancelEdit = () => {
        setEditingLane(null);
    };

    const maxLaneFromItems = Math.max(...itemsWithLanes.map(item => item.lane || 0), 0);
    const maxLane = maxLaneFromItems;

    const formatHeaderDate = (date: Date) => {
        switch (zoomLevel) {
            case 'day':
                return format(date, 'd');
            case 'week': {
                const weekStart = startOfWeek(date, { locale: ptBR, weekStartsOn: 1 });
                const weekEnd = endOfWeek(date, { locale: ptBR, weekStartsOn: 1 });
                return `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM')}`;
            }
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

    // Função para calcular a largura das colunas
    const getColumnWidth = useCallback(() => {
        const minColumnWidth = 60;
        const calculatedWidth = containerWidth / (Math.min(timelineDates.length, 30));
        return Math.max(minColumnWidth, calculatedWidth);
    }, [containerWidth, timelineDates.length]);

    const columnWidth = getColumnWidth();
    const totalGridWidth = columnWidth * timelineDates.length;
    const activeLanes = Array.from({ length: maxLaneFromItems + 1 }, (_, i) => i);
    const totalGridHeight = activeLanes.length * 60;

    const getLaneName = (laneId: number) => {
        const lane = lanes.find(l => l.id === laneId);
        return lane ? lane.name : `Lane ${laneId + 1}`;
    };

    const dateCoverage = useMemo(() => {
        if (!timelineDates.length) return {};

        const coverage: DateCoverage = {};
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

    // Função para calcular a nova data baseada na posição do arrasto
    const calculateNewDate = (pixelOffset: number, referenceDate: Date): Date => {
        switch (zoomLevel) {
            case 'day': {
                // Cada pixel representa uma fração de um dia
                const dayFraction = pixelOffset / columnWidth;
                const dayOffset = Math.round(dayFraction);
                return addDays(referenceDate, dayOffset);
            }
            case 'week': {
                // Cada pixel representa uma fração de uma semana (7 dias)
                const weekFraction = pixelOffset / columnWidth;
                const dayOffset = Math.round(weekFraction * 7);
                return addDays(referenceDate, dayOffset);
            }
            case 'month': {
                // A conversão aqui é aproximada, já que meses têm números diferentes de dias
                // Vamos usar 30 dias como média para simplificar
                const monthFraction = pixelOffset / columnWidth;
                const dayOffset = Math.round(monthFraction * 30);
                return addDays(referenceDate, dayOffset);
            }
            default:
                return referenceDate;
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;

        const itemId = parseInt(active.id as string, 10);
        const item = itemsWithLanes.find(item => item.id === itemId);

        if (!item || delta.x === 0) return;

        // Calcular as novas datas com base no deslocamento
        const startDate = parseISO(item.start);
        const endDate = parseISO(item.end);
        const duration = differenceInCalendarDays(endDate, startDate);

        // Calcular nova data de início baseada na distância arrastada
        const newStartDate = calculateNewDate(delta.x, startDate);
        // A nova data de término mantém a mesma duração
        const newEndDate = addDays(newStartDate, duration);

        // Verificar se as novas datas estão fora do intervalo visível
        if (isBefore(newStartDate, visibleMinDate!) || isAfter(newEndDate, visibleMaxDate!)) {
            let newMin = visibleMinDate!;
            let newMax = visibleMaxDate!;

            if (isBefore(newStartDate, visibleMinDate!)) {
                newMin = subDays(newStartDate, paddingDaysBefore);
            }

            if (isAfter(newEndDate, visibleMaxDate!)) {
                newMax = addDays(newEndDate, paddingDaysAfter);
            }

            // Expandir o intervalo visível se necessário
            if (newMin !== visibleMinDate || newMax !== visibleMaxDate) {
                setVisibleMinDate(newMin);
                setVisibleMaxDate(newMax);
                setContextMinDate(newMin);
                setContextMaxDate(newMax);

                // Recalcular datas da timeline
                const newDates = getTimelineDates(newMin, newMax, zoomLevel, paddingDaysBefore, paddingDaysAfter);
                setTimelineDates(newDates);
            }
        }

        // Formatar as datas no formato ISO
        const formattedStartDate = format(newStartDate, 'yyyy-MM-dd');
        const formattedEndDate = format(newEndDate, 'yyyy-MM-dd');

        // Atualizar o item
        const updatedItem = {
            ...item,
            start: formattedStartDate,
            end: formattedEndDate
        };

        // Atualizar a lista de itens
        const updatedItems = itemsWithLanes.map(i =>
            i.id === itemId ? updatedItem : i
        );

        setItemsWithLanes(assignLanes(updatedItems));
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

                <CursorNavigationControls>
                    <CursorNavigationButton onClick={() => moveCursor('left')}>
                        ← Mover para trás
                    </CursorNavigationButton>
                    <CursorNavigationButton onClick={() => moveCursor('reset')}>
                        ↺ Resetar
                    </CursorNavigationButton>
                    <CursorNavigationButton onClick={() => moveCursor('right')}>
                        Mover para frente →
                    </CursorNavigationButton>
                </CursorNavigationControls>
            </TimelineControls>

            <ScrollContainer
                ref={containerRef}
                onWheel={handleWheel}
            >
                <TimelineHeader>
                    <HeaderLabel>Data</HeaderLabel>
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
                                    key={`date-header-${index}-${format(date, 'yyyy-MM-dd')}`}
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
                    <LanesColumn className="lanes-column">
                        {activeLanes.map((laneId, index) => (
                            <LaneLabel key={laneId} isLast={index === activeLanes.length - 1}>
                                {editingLane === laneId ? (
                                    <>
                                        <LaneNameInput
                                            type="text"
                                            value={newLaneName}
                                            onChange={(e) => setNewLaneName(e.target.value)}
                                            autoFocus
                                        />
                                        <LaneActions>
                                            <SaveButton onClick={() => handleSaveLaneName(laneId)}>
                                                ✓
                                            </SaveButton>
                                            <CancelButton onClick={handleCancelEdit}>
                                                ✕
                                            </CancelButton>
                                        </LaneActions>
                                    </>
                                ) : (
                                    <>
                                        {getLaneName(laneId)}
                                        <EditButton onClick={() => handleEditLane(laneId)}>
                                            ✎
                                        </EditButton>
                                    </>
                                )}
                            </LaneLabel>
                        ))}
                    </LanesColumn>

                    <DndContext onDragEnd={handleDragEnd}>
                        <TimelineGrid
                            style={{
                                width: `${totalGridWidth}px`,
                                height: `${totalGridHeight}px`,
                                position: 'relative'
                            }}
                        >
                            {/* Indicador de Cursor */}
                            <CursorIndicator
                                style={{
                                    left: `${cursorPosition}px`,
                                    height: `${totalGridHeight}px`,
                                }}
                            />

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
                                                minDate={visibleMinDate || dateRange.minDate}
                                                maxDate={visibleMaxDate || dateRange.maxDate}
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
                                            key={`empty-${laneId}-${dateIndex}-${format(date, 'yyyy-MM-dd')}`}
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
                                    key={`vgrid-${index}-${format(date, 'yyyy-MM-dd')}`}
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
            </ScrollContainer>

            <Instructions>
                <p><strong>Instruções:</strong></p>
                <ul>
                    <li>Use os botões de navegação para mover o cursor pela linha do tempo</li>
                    <li>Quando o cursor se aproxima das extremidades, mais datas são adicionadas</li>
                    <li>Clique em "Resetar" para voltar à posição inicial</li>
                    <li>Arraste itens horizontalmente para reposicioná-los no tempo</li>
                    <li>Clique duplo para editar nomes de itens</li>
                    <li>Use os botões de zoom para mudar a visualização</li>
                    <li>Clique no ícone de edição para renomear uma lane</li>
                </ul>
            </Instructions>
        </TimelineContainer>
    );
};

export default Timeline;