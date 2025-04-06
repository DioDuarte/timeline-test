import {
    addDays,
    addMonths,
    differenceInDays, differenceInMonths,
    endOfMonth, endOfWeek,
    format,
    isValid,
    parse,
    startOfMonth, startOfWeek
} from 'date-fns';
import { ZoomLevel } from '../types/types';

/**
 * Formats a date string as YYYY-MM-DD
 */
export function formatDateString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}

/**
 * Parses a date string in YYYY-MM-DD format
 */
export function parseDate(dateString: string): Date {
    const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    if (!isValid(parsedDate)) {
        throw new Error(`Invalid date format: ${dateString}`);
    }
    return parsedDate;
}

/**
 * Gets the number of days between start and end dates
 */
export function getDaysBetween(startDate: string, endDate: string): number {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    return differenceInDays(end, start) + 1; // Include both start and end days
}

/**
 * Gets the range of dates from all timeline items
 */
export function getDateRange(dates: { start: string; end: string }[]): {
    minDate: Date;
    maxDate: Date;
} {
    if (!dates.length) {
        const today = new Date();
        return {
            minDate: today,
            maxDate: addDays(today, 30),
        };
    }

    const allDates = dates.flatMap(({ start, end }) => [
        parseDate(start),
        parseDate(end),
    ]);

    return {
        minDate: new Date(Math.min(...allDates.map(date => date.getTime()))),
        maxDate: new Date(Math.max(...allDates.map(date => date.getTime()))),
    };
}

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
            currentDate = startOfWeek(minDate, { weekStartsOn: 1 }); // Sem padding
            endDate = endOfWeek(maxDate, { weekStartsOn: 1 });
            while (currentDate <= endDate) {
                dates.push(new Date(currentDate));
                currentDate = addDays(currentDate, 7);
            }
            break;
        case 'month':
            currentDate = startOfMonth(minDate); // Sem padding
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
 * Calculates the pixel position for a date based on the timeline width and date range
 */
export function dateToPosition(
    date: Date,
    minDate: Date,
    maxDate: Date,
    width: number
): number {
    const totalDays = differenceInDays(maxDate, minDate) + 1;
    const daysFromStart = differenceInDays(date, minDate);
    return (daysFromStart / totalDays) * width;
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
    // Determinar a data de início do grid com base no zoom
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
    const marginSpace = columnWidth * 0.05; // 5% da largura da coluna como margem

    switch (zoomLevel) {
        case 'day': {
            const startDiffDays = differenceInDays(startDate, gridStartDate);
            const endDiffDays = differenceInDays(endDate, gridStartDate);
            const itemDurationDays = endDiffDays - startDiffDays + 1;

            left = startDiffDays * columnWidth + marginSpace;
            width = itemDurationDays * columnWidth - marginSpace;

            console.log({
                item: `${startDate.toISOString().slice(0,10)} to ${endDate.toISOString().slice(0,10)}`,
                startDiffDays,
                endDiffDays,
                itemDurationDays,
                columnWidth,
                width
            });
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
            const endMonth = startOfMonth(endDate); // Usar o início do mês de endDate para o loop

            // Calcular a diferença em meses para a posição inicial
            const startMonthDiff = differenceInMonths(startMonth, gridStartMonth);
            const totalDaysInStartMonth = differenceInDays(endOfMonth(startDate), startOfMonth(startDate)) + 1;
            const daysFromStartOfMonth = differenceInDays(startDate, startOfMonth(startDate));
            const startProportion = daysFromStartOfMonth / totalDaysInStartMonth;

            left = (startMonthDiff * columnWidth) + (startProportion * columnWidth);

            let totalWidth = 0;
            let currentMonth = startMonth;

            // Ajustar o loop para incluir o mês de endDate
            while (currentMonth <= endMonth) {
                const monthStart = currentMonth;
                const monthEnd = endOfMonth(currentMonth);
                const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;

                // Determinar os dias do item dentro deste mês
                const itemStartInMonth = startDate > monthStart ? startDate : monthStart;
                const itemEndInMonth = endDate < monthEnd ? endDate : monthEnd;
                const daysInThisMonth = differenceInDays(itemEndInMonth, itemStartInMonth) + 1;

                const monthProportion = daysInThisMonth / daysInMonth;
                totalWidth += monthProportion * columnWidth;

                currentMonth = addMonths(currentMonth, 1);
            }

            width = totalWidth; // Remover marginSpace para teste inicial
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