import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ZoomLevel } from '../types/types';

interface TimelineConfig {
    zoomLevel: ZoomLevel;
    paddingUnits: number;
    paddingDaysBefore: number;
    paddingDaysAfter: number;
    setZoomLevel: (zoom: ZoomLevel) => void;
    setPaddingUnits: (units: number) => void;
}

const TimelineContext = createContext<TimelineConfig | undefined>(undefined);

interface TimelineProviderProps {
    children: ReactNode;
}

export const TimelineProvider: React.FC<TimelineProviderProps> = ({ children }) => {
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('day');
    const [paddingUnits, setPaddingUnits] = useState(2);

    const calculatePaddingDays = (units: number, zoom: ZoomLevel): number => {
        switch (zoom) {
            case 'day':
                return units;
            case 'week':
                return 0;
            case 'month':
                return 0;
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