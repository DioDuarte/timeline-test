import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ZoomLevel } from '../types/types';
import {addMonths, differenceInDays} from "date-fns";

interface TimelineConfig {
    zoomLevel: ZoomLevel;
    paddingUnits: number; // Número de unidades de padding (ex.: 2)
    paddingDaysBefore: number; // Valor em dias, calculado com base no zoomLevel
    paddingDaysAfter: number;  // Valor em dias, calculado com base no zoomLevel
    setZoomLevel: (zoom: ZoomLevel) => void;
    setPaddingUnits: (units: number) => void;
}

const TimelineContext = createContext<TimelineConfig | undefined>(undefined);

interface TimelineProviderProps {
    children: ReactNode;
}

export const TimelineProvider: React.FC<TimelineProviderProps> = ({ children }) => {
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('day');
    const [paddingUnits, setPaddingUnits] = useState(2); // Padrão: 2 unidades

    // Função para calcular padding em dias com base no zoomLevel
    const calculatePaddingDays = (units: number, zoom: ZoomLevel): number => {
        switch (zoom) {
            case 'day':
                return units; // Mantém padding para 'day'
            case 'week':
                return 0; // Sem padding para 'week'
            case 'month':
                return 0; // Sem padding para 'month'
            default:
                return units;
        }
    };

    const paddingDaysBefore = calculatePaddingDays(paddingUnits, zoomLevel);
    const paddingDaysAfter = calculatePaddingDays(paddingUnits, zoomLevel);

    const value = {
        zoomLevel,
        paddingUnits,
        paddingDaysBefore,
        paddingDaysAfter,
        setZoomLevel,
        setPaddingUnits,
    };

    return (
        <TimelineContext.Provider value={value}>
            {children}
        </TimelineContext.Provider>
    );
};

export const useTimelineConfig = (): TimelineConfig => {
    const context = useContext(TimelineContext);
    if (!context) {
        throw new Error('useTimelineConfig must be used within a TimelineProvider');
    }
    return context;
};