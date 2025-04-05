// src/components/TimelineItem/TimelineItem.tsx
import React, { useState } from 'react';
import { ItemContainer, ItemContent } from './styles';
import { TimelineItem as TimelineItemType } from '../../types/types';
import { format, parseISO } from 'date-fns';
import { calculateItemPosition } from '../../utils/dateUtils';
import { useTimelineConfig } from '../../context/TimelineContext';

interface TimelineItemProps {
    item: TimelineItemType;
    minDate: Date;
    maxDate: Date;
    totalWidth: number;
    maxLanes: number;
    columnWidth: number;
    onItemChange: (item: TimelineItemType) => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
                                                       item,
                                                       minDate,
                                                       maxDate,
                                                       totalWidth,
                                                       columnWidth,
                                                       maxLanes,
                                                       onItemChange
                                                   }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(item.name);
    const { zoomLevel, paddingDaysBefore } = useTimelineConfig()

    // Usar parseISO para garantir tratamento correto das datas ISO
    const startDate = parseISO(item.start);
    const endDate = parseISO(item.end);

    // Obter lane index com fallback para 0
    const laneIndex = typeof item.lane === 'number' ? item.lane : 0;

    // Calcular posição e dimensões do item usando a função de utilidade
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

    // Funções para edição do nome do item
    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    };

    const handleInputBlur = () => {
        if (editValue.trim()) {
            onItemChange({
                ...item,
                name: editValue.trim()
            });
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

    return (
        <ItemContainer
            style={{
                left: `${left}px`,
                width: `${width}px`,
                top: `${top}px`,
                height: `${height}px`
            }}
            onDoubleClick={handleDoubleClick}
        >
            {isEditing ? (
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
            ) : (
                <ItemContent>
                    {item.name}
                    <div style={{ fontSize: '10px', marginTop: '2px' }}>
                        {format(startDate, 'dd/MM')} - {format(endDate, 'dd/MM')}
                    </div>
                </ItemContent>
            )}
        </ItemContainer>
    );
};

export default TimelineItem;