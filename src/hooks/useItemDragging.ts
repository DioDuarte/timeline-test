import { useState, useEffect } from 'react';
import { useDraggable, UniqueIdentifier } from '@dnd-kit/core';

// Definindo um tipo genérico para o itemData
export function useItemDragging<T extends Record<string, any>>(
    itemId: UniqueIdentifier,
    itemData: T
) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: itemId,
        data: itemData,  // O tipo será inferido corretamente
    });

    useEffect(() => {
        setDragPosition({
            x: transform ? transform.x : 0,
            y: 0
        });
    }, [transform]);

    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);

    return {
        isDragging,
        dragPosition,
        attributes,
        listeners,
        setNodeRef,
        transform,
        handleDragStart,
        handleDragEnd
    };
}