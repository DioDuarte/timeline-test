// src/components/TimelineCursor/TimelineCursor.tsx
import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';

const CursorContainer = styled.div`
    position: absolute;
    width: 2px;
    background: rgba(255, 0, 0, 0.7);
    z-index: 25;
    top: 0;
    box-shadow: 0 0 8px rgba(255, 0, 0, 0.5);
    cursor: ew-resize;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: -7px;
        width: 16px;
        height: 16px;
        background: red;
        border-radius: 50%;
        box-shadow: 0 0 6px 1px rgba(255, 0, 0, 0.7);
    }

    &::before {
        content: '';
        position: absolute;
        left: -8px;
        width: 18px;
        height: 100%;
        cursor: ew-resize;
    }
`;

interface TimelineCursorProps {
    position: number;
    height: number;
    onPositionChange: (newPosition: number) => void;
}

const TimelineCursor: React.FC<TimelineCursorProps> = ({
                                                           position,
                                                           height,
                                                           onPositionChange
                                                       }) => {
    const [isDragging, setIsDragging] = useState(false);
    const cursorRef = useRef<HTMLDivElement>(null);
    const dragStartPosRef = useRef<{ x: number, cursorPos: number }>({ x: 0, cursorPos: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && cursorRef.current) {
                const deltaX = e.clientX - dragStartPosRef.current.x;
                const newPosition = dragStartPosRef.current.cursorPos + deltaX;
                onPositionChange(newPosition);
                e.preventDefault();
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, onPositionChange]);

    const handleMouseDown = (e: React.MouseEvent) => {
        dragStartPosRef.current = {
            x: e.clientX,
            cursorPos: position
        };
        setIsDragging(true);
        e.stopPropagation();
    };

    return (
        <CursorContainer
            ref={cursorRef}
            style={{
                left: `${position}px`,
                height: `${height}px`,
            }}
            onMouseDown={handleMouseDown}
        />
    );
};

export default TimelineCursor;