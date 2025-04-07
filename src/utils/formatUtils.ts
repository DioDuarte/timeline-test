// src/utils/formatUtils.ts
import {
    format,
    parse,
    isValid,
    startOfWeek,
    endOfWeek,
    Locale,
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
export function formatTimelineHeaderDate(
    date: Date,
    zoomLevel: ZoomLevel,
    locale: Locale = ptBR
): string {
    switch (zoomLevel) {
        case 'day':
            return format(date, 'dd/MM/yy');
        case 'week':
            return `${format(startOfWeek(date, { locale, weekStartsOn: 1 }), 'dd/MM')} - ${format(endOfWeek(date, { locale, weekStartsOn: 1 }), 'dd/MM')}`;
        case 'month':
            return format(date, 'MMM yyyy', { locale });
        default:
            return '';
    }
}

/**
 * Formats a date for display in a tooltip or detailed view
 * @param date - The date to format
 * @param locale - The locale to use for formatting (defaults to ptBR)
 * @returns A string in the format 'dd/MM/yyyy (EEEE)'
 */
export function formatDetailedDate(date: Date, locale: Locale = ptBR): string {
    return `${format(date, 'dd/MM/yyyy')} (${format(date, 'EEEE', { locale })})`;
}

/**
 * Formats a day of the week for sub-labels (e.g., in 'day' zoom level)
 * @param date - The date to format
 * @param locale - The locale to use for formatting (defaults to ptBR)
 * @returns A string with the abbreviated day of the week (e.g., 'Seg')
 */
export function formatDayOfWeek(date: Date, locale: Locale = ptBR): string {
    return format(date, 'EEE', { locale });
}