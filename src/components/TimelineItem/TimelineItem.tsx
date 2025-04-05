import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { ItemContainer, ItemContent } from './styles';
import { TimelineItem as TimelineItemType } from '../../types/types';
import { format, parseISO } from 'date-fns';
import { calculateItemPosition } from '../../utils/dateUtils';
import { useTimelineConfig } from '../../context/TimelineContext';
import { useDraggable } from '@dnd-kit/core';

interface TimelineItemProps {
    item: TimelineItemType;
    items: TimelineItemType[];
    minDate: Date;
    maxDate: Date;
    totalWidth: number;
    columnWidth: number;
    maxLanes: number;
    onItemChange: (items: TimelineItemType[]) => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
                                                       item,
                                                       items,
                                                       minDate,
                                                       maxDate,
                                                       totalWidth,
                                                       columnWidth,
                                                       maxLanes,
                                                       onItemChange
                                                   }) => {
    // Estados
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(item.name);
    const [isDragging, setIsDragging] = useState(false);
    const [hasEnoughSpace, setHasEnoughSpace] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

    // Refs
    const contentRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Contexto e dados
    const { zoomLevel, paddingDaysBefore } = useTimelineConfig();
    const startDate = parseISO(item.start);
    const endDate = parseISO(item.end);
    const laneIndex = typeof item.lane === 'number' ? item.lane : 0;

    // Cálculo da posição
    const { left, width, top, height } = calculateItemPosition(
        startDate,
        endDate,
        minDate,
        maxDate,
        columnWidth,
        laneIndex,
        paddingDaysBefore,
        zoomLevel
    );

    // Configuração de arrastar
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: item.id,
        data: { item },
    });

    // Verificação de espaço para texto
    useEffect(() => {
        const checkTextFit = () => {
            if (contentRef.current && containerRef.current) {
                const contentWidth = contentRef.current.scrollWidth;
                const containerWidth = containerRef.current.clientWidth;
                setHasEnoughSpace(containerWidth >= contentWidth);
            }
        };

        checkTextFit();
        window.addEventListener('resize', checkTextFit);
        return () => window.removeEventListener('resize', checkTextFit);
    }, [item.name, width]);

    // Atualiza posição de arrastar
    useEffect(() => {
        setDragPosition({
            x: transform ? transform.x : 0,
            y: 0
        });
    }, [transform]);

    // Funções de manipulação
    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);
    const handleDoubleClick = () => setIsEditing(true);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    };

    const handleInputBlur = () => {
        if (editValue.trim()) {
            const updatedItem = { ...item, name: editValue.trim() };
            const updatedItems = items.map(i => (i.id === item.id ? updatedItem : i));
            onItemChange(updatedItems);
        }
        setIsEditing(false);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        } else if (e.key === 'Escape') {
            setEditValue(item.name);
            setIsEditing(false);
        }
    };

    // Mescla refs para uso com dnd-kit e nosso containerRef
    const mergeRefs = (...refs: any[]) => (value: any) => {
        refs.forEach(ref => {
            if (typeof ref === 'function') ref(value);
            else if (ref != null) ref.current = value;
        });
    };

    // Estilo do item
    const style: CSSProperties = {
        position: 'absolute',
        left: `${left}px`,
        width: `${Math.min(width, totalWidth - left)}px`,
        top: `${top}px`,
        height: `${height}px`,
        transform: transform ? `translate(${dragPosition.x}px, ${dragPosition.y}px)` : undefined,
        cursor: 'ew-resize',
    };

    // Renderização condicional para modo de edição ou exibição
    const renderContent = () => {
        if (isEditing) {
            return (
                <input
                    type="text"
                    value={editValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    autoFocus
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        background: 'transparent',
                        padding: '4px 8px',
                        boxSizing: 'border-box',
                        fontSize: '12px',
                        color: 'white'
                    }}
                />
            );
        }

        return (
            <ItemContent ref={contentRef}>
                {item.name}
                <div style={{ fontSize: '10px', marginTop: '2px' }}>
                    {format(startDate, 'dd/MM')} - {format(endDate, 'dd/MM')}
                </div>
            </ItemContent>
        );
    };

    return (
        <ItemContainer
            ref={mergeRefs(containerRef, setNodeRef)}
            data-dragging={isDragging}
            data-has-space={hasEnoughSpace}
            {...listeners}
            {...attributes}
            style={style}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDoubleClick={handleDoubleClick}
            className="timeline-item"
        >
            {renderContent()}
        </ItemContainer>
    );
};

export default TimelineItem;