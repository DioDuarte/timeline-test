
import {useLocalization} from "../../context/LocalizationContext";
import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { ItemContainer, ItemContent } from './styles';
import { TimelineItem as TimelineItemType } from '../../types/types';
import { format, parseISO } from 'date-fns';
import { calculateItemPosition } from '../../utils/dateUtils';
import { useTimelineConfig } from '../../context/TimelineContext';
import { useDraggable } from '@dnd-kit/core';
import { EditItemModal } from './EditItem/EditItemModal';
import {assignLanes} from "../../utils/assignLanes";
import {ptBR} from "date-fns/locale";

interface TimelineItemProps {
    item: TimelineItemType;
    items: TimelineItemType[];
    minDate: Date;
    maxDate: Date;
    totalWidth: number;
    columnWidth: number;
    maxLanes: number;
    onItemChange: (items: TimelineItemType[]) => void;
    onModalStateChange: (isOpen: boolean) => void;
    isHovered?: boolean;
    isSelected?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
                                                       item,
                                                       items,
                                                       minDate,
                                                       maxDate,
                                                       totalWidth,
                                                       columnWidth,
                                                       maxLanes,
                                                       onItemChange,
                                                       onModalStateChange,
                                                       isHovered,
                                                       isSelected
                                                   }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hasEnoughSpace, setHasEnoughSpace] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const { locale } = useLocalization();
    const dateFormat = locale === ptBR ? 'dd/MM' : 'MM/dd';

    const contentRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { zoomLevel, paddingDaysBefore } = useTimelineConfig();
    const startDate = parseISO(item.start);
    const endDate = parseISO(item.end);
    const laneIndex = typeof item.lane === 'number' ? item.lane : 0;

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

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: item.id,
        data: { item },
    });

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

    useEffect(() => {
        if (transform) {
            const newX = transform.x;
            const minX = -left;
            const maxX = totalWidth - (left + width);
            const clampedX = Math.max(minX, Math.min(newX, maxX));
            setDragPosition({ x: clampedX, y: 0 });
        } else {
            setDragPosition({ x: 0, y: 0 });
        }
    }, [transform, left, width, totalWidth]);

    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);
    const handleDoubleClick = () => {
        setIsModalOpen(true);
        onModalStateChange(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        onModalStateChange(false);
    }

    const handleSave = (updatedItem: { name: string; start: string; end: string }) => {
        const updated = { ...item, ...updatedItem };
        const updatedItems = items.map((i) => (i.id === item.id ? updated : i));
        onItemChange(assignLanes(updatedItems));
        setIsModalOpen(false);
        onModalStateChange(false);
    };

    const mergeRefs = (...refs: any[]) => (value: any) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') ref(value);
            else if (ref != null) ref.current = value;
        });
    };

    const style: CSSProperties = {
        position: 'absolute',
        left: `${left}px`,
        width: `${Math.min(width, totalWidth - left)}px`,
        top: `${top}px`,
        height: `${height}px`,
        transform: transform ? `translate(${dragPosition.x}px, ${dragPosition.y}px)` : undefined,
        cursor: 'ew-resize',
    };

    return (
        <>
            <ItemContainer
                ref={mergeRefs(containerRef, setNodeRef)}
                data-dragging={isDragging}
                data-has-space={hasEnoughSpace}
                data-hovered={isHovered}
                data-selected={isSelected}
                {...listeners}
                {...attributes}
                style={style}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDoubleClick={handleDoubleClick}
                className="timeline-item"
            >
                <ItemContent ref={contentRef}>
                    {item.name}
                    <div style={{ fontSize: '10px', marginTop: '2px' }}>
                        {format(startDate, dateFormat,  {locale})} - {format(endDate, dateFormat, {locale})}
                    </div>
                </ItemContent>
            </ItemContainer>

            {isModalOpen && (
                <EditItemModal
                    item={item}
                    onSave={handleSave}
                    onClose={() => handleCloseModal()}
                />
            )}
        </>
    );
};

export default TimelineItem;