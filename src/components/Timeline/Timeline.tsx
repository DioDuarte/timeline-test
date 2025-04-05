import React, { useState, useEffect, useRef, useMemo } from 'react';
import {differenceInCalendarDays, endOfWeek, format, parseISO, startOfDay, startOfWeek} from 'date-fns';
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
    EmptyCell
} from './styles';
import {TimelineItem as TimelineItemType, ZoomLevel} from '../../types/types';
import { assignLanes } from '../../utils/assignLanes';
import { useTimelineConfig } from '../../context/TimelineContext';
import { getDateRange, getTimelineDates } from '../../utils/dateUtils';
import TimelineItem from '../TimelineItem/TimelineItem';

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

    const { zoomLevel, setZoomLevel, paddingDaysBefore, paddingDaysAfter } = useTimelineConfig();

    // Estado para gerenciar nomes das lanes
    const [lanes, setLanes] = useState<Lane[]>([]);
    const [editingLane, setEditingLane] = useState<number | null>(null);
    const [newLaneName, setNewLaneName] = useState('');

    // Calculate date range and timeline dates
    const { minDate, maxDate } = getDateRange(items);
    const timelineDates = getTimelineDates(minDate, maxDate, zoomLevel, paddingDaysBefore, paddingDaysAfter);

    // Update container width on resize
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth - 100);
            }
        };

        window.addEventListener('resize', updateWidth);
        updateWidth();

        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Assign lanes to items
    useEffect(() => {
        const newItemsWithLanes = assignLanes(items);
        setItemsWithLanes(newItemsWithLanes);

        const maxLaneFromItems = Math.max(...newItemsWithLanes.map(item => item.lane || 0), 0);
        if (lanes.length === 0 && maxLaneFromItems > 0) {
            const initialLanes = Array.from({ length: maxLaneFromItems + 1 }, (_, i) => ({
                id: i,
                name: `Lane ${i + 1}`
            }));
            setLanes(initialLanes);
        }
    }, [items]);

    // Handle zoom on scroll
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (e.altKey) { // Zoom só ativa com Ctrl pressionado
            e.preventDefault(); // Impede o scroll padrão apenas durante o zoom
            const zoomLevels: ZoomLevel[] = ['day', 'week', 'month'];
            const currentIndex = zoomLevels.indexOf(zoomLevel);

            // DeltaY > 0 significa scroll para baixo (zoom out), < 0 significa scroll para cima (zoom in)
            let newIndex = currentIndex + (e.deltaY > 0 ? 1 : -1);

            // Limita o índice ao intervalo válido
            newIndex = Math.max(0, Math.min(newIndex, zoomLevels.length - 1));

            const newZoomLevel = zoomLevels[newIndex];
            if (newZoomLevel !== zoomLevel) {
                setZoomLevel(newZoomLevel);
            }
        }
    };

    // Handle item changes
    const handleItemChange = (updatedItem: TimelineItemType) => {
        const updatedItems = items.map(item =>
            item.id === updatedItem.id ? updatedItem : item
        );
        const newItemsWithLanes = assignLanes(updatedItems);
        setItemsWithLanes(newItemsWithLanes);
    };

    // Funções de edição de lane (mantidas como estão)
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

    const getColumnWidth = () => {
        switch (zoomLevel) {
            case 'day':
                return Math.max(60, containerWidth / timelineDates.length);
            case 'week':
                return containerWidth / timelineDates.length;
            case 'month':
                return containerWidth / timelineDates.length;
        }
    };

    const columnWidth = getColumnWidth();
    const totalGridWidth = columnWidth * timelineDates.length;
    const totalGridHeight = (maxLane + 1) * 100;
    const totalDays = differenceInCalendarDays(maxDate, minDate) + 1;
    const totalWidth = totalDays * columnWidth;

    const getLaneName = (laneId: number) => {
        const lane = lanes.find(l => l.id === laneId);
        return lane ? lane.name : `Lane ${laneId + 1}`;
    };

    const dateCoverage = useMemo(() => {
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

            <ScrollContainer ref={containerRef} onWheel={handleWheel}>
                <TimelineHeader>
                    <HeaderLabel>Data</HeaderLabel>
                    <DateHeaderContainer style={{ width: `${totalGridWidth}px` }}>
                        {zoomLevel === 'day' && (
                            <div className="month-row">
                                {timelineDates.map((date, index) => (
                                    shouldShowMonth(date, index) && (
                                        <div
                                            key={`month-${index}`}
                                            className="month-label"
                                            style={{ left: `${index * columnWidth}px` }}
                                        >
                                            {format(date, 'MMMM', { locale: ptBR })}
                                        </div>
                                    )
                                ))}
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
                    <LanesColumn>
                        {Array.from({ length: maxLane + 1 }).map((_, index) => (
                            <LaneLabel key={index} isLast={index === maxLane}>
                                {editingLane === index ? (
                                    <>
                                        <LaneNameInput
                                            type="text"
                                            value={newLaneName}
                                            onChange={(e) => setNewLaneName(e.target.value)}
                                            autoFocus
                                        />
                                        <LaneActions>
                                            <SaveButton onClick={() => handleSaveLaneName(index)}>
                                                ✓
                                            </SaveButton>
                                            <CancelButton onClick={handleCancelEdit}>
                                                ✕
                                            </CancelButton>
                                        </LaneActions>
                                    </>
                                ) : (
                                    <>
                                        {getLaneName(index)}
                                        <EditButton onClick={() => handleEditLane(index)}>
                                            ✎
                                        </EditButton>
                                    </>
                                )}
                            </LaneLabel>
                        ))}
                    </LanesColumn>

                    <TimelineGrid style={{ width: `${totalGridWidth}px` }}>
                        {Array.from({ length: maxLane + 1 }).map((_, laneId) => (
                            timelineDates.map((date, dateIndex) => (
                                !dateCoverage[laneId]?.[format(date, 'yyyy-MM-dd')] && (
                                    <EmptyCell
                                        key={`empty-${laneId}-${dateIndex}`}
                                        style={{
                                            top: `${laneId * 100}%`,
                                            left: `${dateIndex * columnWidth}px`,
                                            width: `${columnWidth}px`,
                                            height: `${100 / (maxLane + 1)}%`
                                        }}
                                    />
                                )
                            ))
                        ))}
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
                        {Array.from({ length: maxLane }).map((_, index) => (
                            <HorizontalGridLine
                                key={`hgrid-${index}`}
                                style={{ top: `${((index + 1) / (maxLane + 1)) * 100}%` }}
                            />
                        ))}
                        {itemsWithLanes.map(item => (
                            <TimelineItem
                                key={item.id}
                                item={item}
                                minDate={minDate}
                                maxDate={maxDate}
                                totalWidth={totalWidth}
                                maxLanes={maxLane + 1}
                                columnWidth={columnWidth}
                                onItemChange={handleItemChange}
                            />
                        ))}
                    </TimelineGrid>
                </TimelineBody>
            </ScrollContainer>

            <Instructions>
                <p><strong>Instruções:</strong></p>
                <ul>
                    <li>Arraste itens para mudar sua posição</li>
                    <li>Redimensione itens arrastando as bordas esquerdas ou direitas</li>
                    <li>Clique duplo para editar nomes de itens</li>
                    <li>Use os botões de zoom ou role o mouse com Ctrl pressionado para mudar a visualização</li>
                    <li>Clique no ícone de edição para renomear uma lane</li>
                    <li>Áreas em cinza claro indicam dias sem itens programados</li>
                </ul>
            </Instructions>
        </TimelineContainer>
    );
};

export default Timeline;