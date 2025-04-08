import {
    format,
    parse,
    isValid,
    Locale, startOfWeek, endOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ZoomLevel } from '../types/types';

/**
 * Formats a date as YYYY-MM-DD
 * @param date - The date to format
 * @returns A string in 'yyyy-MM-dd' format
 */
export function formatDateString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}

/**
 * Parses a date string in YYYY-MM-DD format
 * @param dateString - The date string to parse
 * @returns A Date object
 * @throws Error if the date string is invalid
 */
export function parseDate(dateString: string): Date {
    const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    if (!isValid(parsedDate)) {
        throw new Error(`Invalid date format: ${dateString}`);
    }
    return parsedDate;
}

/**
 * Formats a date for the timeline header based on the zoom level
 * @param date - The date to format
 * @param zoomLevel - The current zoom level ('day', 'week', 'month')
 * @param locale - The locale to use for formatting (defaults to ptBR)
 * @returns A formatted string suitable for the timeline header
 */
export const formatTimelineHeaderDate = (date: Date, zoomLevel: ZoomLevel, locale: Locale): string => {
    const isPortuguese = locale === ptBR;
    const dateFormat = isPortuguese ? 'dd/MM' : 'MM/dd';

    switch (zoomLevel) {
        case 'day':
            return format(date, dateFormat, { locale });
        case 'week': {
            const start = startOfWeek(date, { locale, weekStartsOn: 1 });
            const end = endOfWeek(date, { locale, weekStartsOn: 1 });
            return `${format(start, dateFormat, { locale })} - ${format(end, dateFormat, { locale })}`;
        }
        case 'month':
            return format(date, 'MMMM yyyy', { locale });
        default:
            return format(date, dateFormat, { locale });
    }
};

/**
 * Formats a date for display in a tooltip or detailed view
 * @param date - The date to format
 * @param locale - The locale to use for formatting (defaults to ptBR)
 * @returns A string in the format 'dd/MM/yyyy (EEEE)'
 */
export const formatDetailedDate = (date: Date, locale: Locale): string => {
    return format(date, 'PPPP', { locale });
};

/**
 * Formats a day of the week for sub-labels (e.g., in 'day' zoom level)
 * @param date - The date to format
 * @param locale - The locale to use for formatting (defaults to ptBR)
 * @returns A string with the abbreviated day of the week (e.g., 'Seg')
 */
export const formatDayOfWeek = (date: Date, locale: Locale): string => {
    return format(date, 'EEE', { locale });
};