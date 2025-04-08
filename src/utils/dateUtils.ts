import {
    addDays,
    addMonths, addWeeks, differenceInCalendarDays,
    differenceInDays, differenceInMonths,
    endOfMonth, endOfWeek,
    format,
    startOfMonth, startOfWeek, subDays, subMonths, subWeeks
} from 'date-fns';
import { ZoomLevel } from '../types/types';
import React from "react";
import { ptBR } from 'date-fns/locale';



/**
 * Returns a list of dates for the timeline header based on the date range and zoom level
 */
export function getTimelineDates(
    minDate: Date,
    maxDate: Date,
    zoomLevel: ZoomLevel,
    paddingDaysBefore: number,
    paddingDaysAfter: number
): Date[] {
    const dates: Date[] = [];
    let currentDate: Date;
    let endDate: Date;

    switch (zoomLevel) {
        case 'day':
            currentDate = addDays(minDate, -paddingDaysBefore);
            endDate = addDays(maxDate, paddingDaysAfter);
            while (currentDate <= endDate) {
                dates.push(new Date(currentDate));
                currentDate = addDays(currentDate, 1);
            }
            break;
        case 'week':
            currentDate = startOfWeek(minDate, { weekStartsOn: 1 });
            endDate = endOfWeek(maxDate, { weekStartsOn: 1 });
            while (currentDate <= endDate) {
                dates.push(new Date(currentDate));
                currentDate = addDays(currentDate, 7);
            }
            break;
        case 'month':
            currentDate = startOfMonth(minDate);
            endDate = endOfMonth(maxDate);
            while (currentDate <= endDate) {
                dates.push(new Date(currentDate));
                currentDate = addMonths(currentDate, 1);
            }
            break;
    }

    return dates;
}


/**
 * Calcula a posição e dimensões de um item na timeline
 */
export function calculateItemPosition(
    startDate: Date,
    endDate: Date,
    minDate: Date,
    maxDate: Date,
    columnWidth: number,
    laneIndex: number,
    paddingDaysBefore: number,
    zoomLevel: ZoomLevel,
    laneHeight: number = 60,
    itemHeight: number = 50
): {
    left: number;
    width: number;
    height: number;
    top: number;

} {

    let gridStartDate: Date;
    switch (zoomLevel) {
        case 'day':
            gridStartDate = addDays(minDate, -paddingDaysBefore);
            break;
        case 'week':
            gridStartDate = startOfWeek(addDays(minDate, -paddingDaysBefore), { weekStartsOn: 1 });
            break;
        case 'month':
            gridStartDate = startOfMonth(addDays(minDate, -paddingDaysBefore));
            break;
    }

    let left: number;
    let width: number;
    const marginSpace = columnWidth * 0.05;

    switch (zoomLevel) {
        case 'day': {
            const startDiffDays = differenceInDays(startDate, gridStartDate);
            const endDiffDays = differenceInDays(endDate, gridStartDate);
            const itemDurationDays = endDiffDays - startDiffDays + 1;

            left = startDiffDays * columnWidth + marginSpace;
            width = itemDurationDays * columnWidth - marginSpace;
            break;
        }
        case 'week': {
            const daysPerColumn = 7;
            const startDiffDays = differenceInDays(startDate, gridStartDate);
            const endDiffDays = differenceInDays(endDate, gridStartDate);
            const itemDurationDays = endDiffDays - startDiffDays + 1;

            const columnStartIndex = Math.floor(startDiffDays / daysPerColumn);
            const daysFromColumnStart = startDiffDays % daysPerColumn;

            left = (columnStartIndex * columnWidth) + (daysFromColumnStart / daysPerColumn) * columnWidth;
            width = (itemDurationDays / daysPerColumn) * columnWidth - marginSpace;
            break;
        }
        case 'month': {
            const gridStartMonth = startOfMonth(gridStartDate);
            const startMonth = startOfMonth(startDate);
            const endMonth = startOfMonth(endDate);


            const startMonthDiff = differenceInMonths(startMonth, gridStartMonth);
            const totalDaysInStartMonth = differenceInDays(endOfMonth(startDate), startOfMonth(startDate)) + 1;
            const daysFromStartOfMonth = differenceInDays(startDate, startOfMonth(startDate));
            const startProportion = daysFromStartOfMonth / totalDaysInStartMonth;

            left = (startMonthDiff * columnWidth) + (startProportion * columnWidth);

            let totalWidth = 0;
            let currentMonth = startMonth;


            while (currentMonth <= endMonth) {
                const monthStart = currentMonth;
                const monthEnd = endOfMonth(currentMonth);
                const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;


                const itemStartInMonth = startDate > monthStart ? startDate : monthStart;
                const itemEndInMonth = endDate < monthEnd ? endDate : monthEnd;
                const daysInThisMonth = differenceInDays(itemEndInMonth, itemStartInMonth) + 1;

                const monthProportion = daysInThisMonth / daysInMonth;
                totalWidth += monthProportion * columnWidth;

                currentMonth = addMonths(currentMonth, 1);
            }

            width = totalWidth;
            break;
        }
    }

    const top = laneIndex * laneHeight;

    return {
        left,
        width: Math.max(width, 20),
        top: top + 5 ,
        height: itemHeight
    };
}

export function calculateFocusIndicatorPosition(
    date: Date | null,
    timelineDates: Date[],
    zoomLevel: ZoomLevel,
    columnWidth: number
): number {
    if (!date) return 0;

    let position = 0;

    switch (zoomLevel) {
        case 'day':
            const dayIndex = timelineDates.findIndex(d =>
                format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            );
            position = dayIndex >= 0 ? dayIndex * columnWidth + columnWidth / 2 : 0;
            break;
        case 'week':
            const weekStartDate = startOfWeek(date, { weekStartsOn: 1 });
            const weekIndex = timelineDates.findIndex(d =>
                format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd') === format(weekStartDate, 'yyyy-MM-dd')
            );
            if (weekIndex >= 0) {
                const dayInWeek = differenceInCalendarDays(date, weekStartDate);
                position = weekIndex * columnWidth + (dayInWeek / 7) * columnWidth;
            }
            break;
        case 'month':
            const monthStart = startOfMonth(date);
            const monthIndex = timelineDates.findIndex(d =>
                format(d, 'yyyy-MM') === format(date, 'yyyy-MM')
            );
            if (monthIndex >= 0) {
                const dayOfMonth = date.getDate() - 1;
                const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                position = monthIndex * columnWidth + (dayOfMonth / daysInMonth) * columnWidth;
            }
            break;
    }

    return position;
}

export function getDateAtPosition(
    x: number,
    timelineDates: Date[],
    columnWidth: number,
    zoomLevel: ZoomLevel,
    containerRef: React.RefObject<HTMLDivElement | null>
): Date {
    if (!containerRef.current) return new Date();

    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeX = x - containerRect.left + containerRef.current.scrollLeft;

    switch (zoomLevel) {
        case 'day':
            const dayColumnIndex = Math.floor(relativeX / columnWidth);
            const safeDayIndex = Math.max(0, Math.min(dayColumnIndex, timelineDates.length - 1));
            return timelineDates[safeDayIndex];

        case 'week':
            const weekColumnIndex = Math.floor(relativeX / columnWidth);
            const safeWeekIndex = Math.max(0, Math.min(weekColumnIndex, timelineDates.length - 1));
            const weekStartDate = startOfWeek(timelineDates[safeWeekIndex], { weekStartsOn: 1 });
            const positionInWeek = relativeX - (weekColumnIndex * columnWidth);
            const proportionInWeek = positionInWeek / columnWidth;
            const dayOfWeekFloat = proportionInWeek * 7;
            const dayOfWeek = Math.floor(dayOfWeekFloat);
            return addDays(weekStartDate, Math.min(dayOfWeek, 6));

        case 'month':
            const monthColumnIndex = Math.floor(relativeX / columnWidth);
            const safeMonthIndex = Math.max(0, Math.min(monthColumnIndex, timelineDates.length - 1));
            const monthStartDate = startOfMonth(timelineDates[safeMonthIndex]);
            const daysInMonth = new Date(
                monthStartDate.getFullYear(),
                monthStartDate.getMonth() + 1,
                0
            ).getDate();
            const positionInMonth = relativeX - (monthColumnIndex * columnWidth);
            const proportionInMonth = positionInMonth / columnWidth;
            const dayOfMonthFloat = proportionInMonth * daysInMonth;
            const dayOfMonth = Math.floor(dayOfMonthFloat) + 1;
            return new Date(
                monthStartDate.getFullYear(),
                monthStartDate.getMonth(),
                Math.min(dayOfMonth, daysInMonth)
            );

        default:
            return new Date();
    }
}


export function findDateIndex(date: Date, timelineDates: Date[], zoomLevel: ZoomLevel) {
    switch (zoomLevel) {
        case 'day':
            return timelineDates.findIndex((d) => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
        case 'week':
            return timelineDates.findIndex((d) => {
                const weekStart = startOfWeek(d, { locale: ptBR, weekStartsOn: 1 });
                const itemWeekStart = startOfWeek(date, { locale: ptBR, weekStartsOn: 1 });
                return format(weekStart, 'yyyy-MM-dd') === format(itemWeekStart, 'yyyy-MM-dd');
            });
        case 'month':
            return timelineDates.findIndex((d) => format(d, 'yyyy-MM') === format(date, 'yyyy-MM'));
        default:
            return -1;
    }
}

export function expandMinDate(currentMin: Date, zoomLevel: ZoomLevel, steps: number = 20): Date {
    switch (zoomLevel) {
        case 'day': return subDays(currentMin, steps);
        case 'week': return subWeeks(currentMin, steps - 16);
        case 'month': return subMonths(currentMin, steps - 18);
        default: return currentMin;
    }
}

export function expandMaxDate(currentMax: Date, zoomLevel: ZoomLevel, steps: number = 20): Date {
    switch (zoomLevel) {
        case 'day': return addDays(currentMax, steps);
        case 'week': return addWeeks(currentMax, steps);
        case 'month': return addMonths(currentMax, steps);
        default: return currentMax;
    }
}