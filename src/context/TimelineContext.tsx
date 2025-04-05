// src/context/TimelineContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { addDays, subDays } from 'date-fns';
import { ZoomLevel } from '../types/types';

interface TimelineConfigContextType {
    zoomLevel: ZoomLevel;
    setZoomLevel: (zoom: ZoomLevel) => void;
    minDate: Date;
    maxDate: Date;
    setMinDate: (date: Date) => void;
    setMaxDate: (date: Date) => void;
    extendDateRange: (direction: 'before' | 'after', days: number) => void;
    paddingDaysBefore: number;
    paddingDaysAfter: number;
    setPaddingDaysBefore: (days: number) => void;
    setPaddingDaysAfter: (days: number) => void;
}

const TimelineConfigContext = createContext<TimelineConfigContextType | undefined>(undefined);

interface TimelineProviderProps {
    children: ReactNode;
    initialZoom?: ZoomLevel;
    initialMinDate?: Date;
    initialMaxDate?: Date;
    initialPaddingBefore?: number;
    initialPaddingAfter?: number;
}

export const TimelineProvider: React.FC<TimelineProviderProps> = ({
                                                                      children,
                                                                      initialZoom = 'day',
                                                                      initialMinDate = new Date(2021, 0, 1), // 1º de Janeiro de 2021
                                                                      initialMaxDate = new Date(2021, 11, 31), // 31 de Dezembro de 2021
                                                                      initialPaddingBefore = 7,
                                                                      initialPaddingAfter = 7,
                                                                  }) => {
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(initialZoom);
    const [minDate, setMinDate] = useState<Date>(initialMinDate);
    const [maxDate, setMaxDate] = useState<Date>(initialMaxDate);
    const [paddingDaysBefore, setPaddingDaysBefore] = useState<number>(initialPaddingBefore);
    const [paddingDaysAfter, setPaddingDaysAfter] = useState<number>(initialPaddingAfter);

    // Função para estender o intervalo de datas em qualquer direção
    const extendDateRange = useCallback((direction: 'before' | 'after', days: number) => {
        if (direction === 'before') {
            setMinDate(prev => subDays(prev, days));
        } else {
            setMaxDate(prev => addDays(prev, days));
        }
    }, []);

    const value = {
        zoomLevel,
        setZoomLevel,
        minDate,
        maxDate,
        setMinDate,
        setMaxDate,
        extendDateRange,
        paddingDaysBefore,
        paddingDaysAfter,
        setPaddingDaysBefore,
        setPaddingDaysAfter,
    };

    return (
        <TimelineConfigContext.Provider value={value}>
            {children}
        </TimelineConfigContext.Provider>
    );
};

export const useTimelineConfig = (): TimelineConfigContextType => {
    const context = useContext(TimelineConfigContext);
    if (!context) {
        throw new Error('useTimelineConfig deve ser usado dentro de um TimelineProvider');
    }
    return context;
};