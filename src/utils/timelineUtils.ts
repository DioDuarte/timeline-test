
import { DragEndEvent } from '@dnd-kit/core';
import { TimelineItem, ZoomLevel } from '../types/types';
import {parseISO, addDays, format, differenceInCalendarDays} from 'date-fns';
import {assignLanes} from "./assignLanes";

export function handleItemDragEnd(
    event: DragEndEvent,
    items: TimelineItem[],
    timelineDates: Date[],
    columnWidth: number,
    zoomLevel: ZoomLevel,
    setItems: (items: TimelineItem[]) => void,
    expandDates: (startDate: Date, endDate: Date) => void
) {
    const { active, delta } = event;
    const itemId = parseInt(active.id as string, 10);
    const item = items.find((i) => i.id === itemId);

    if (!item || delta.x === 0) return;

    const startDate = parseISO(item.start);
    const endDate = parseISO(item.end);
    const duration = differenceInCalendarDays(endDate, startDate);

    const firstDate = timelineDates[0];
    const lastDate = timelineDates[timelineDates.length - 1];

    const calculateNewDate = (pixelOffset: number, referenceDate: Date) => {
        let newDate: Date;
        switch (zoomLevel) {
            case 'day':
                newDate = addDays(referenceDate, Math.round(pixelOffset / columnWidth));
                break;
            case 'week':
                newDate = addDays(referenceDate, Math.round((pixelOffset / columnWidth) * 7));
                break;
            case 'month':
                newDate = addDays(referenceDate, Math.round((pixelOffset / columnWidth) * 30));
                break;
            default:
                newDate = referenceDate;
        }
        return newDate < firstDate ? firstDate : newDate > lastDate ? lastDate : newDate;
    };

    const newStartDate = calculateNewDate(delta.x, startDate);
    const newEndDate = addDays(newStartDate, duration);

    expandDates(newStartDate, newEndDate);

    const updatedItem = { ...item, start: format(newStartDate, 'yyyy-MM-dd'), end: format(newEndDate, 'yyyy-MM-dd') };
    const updatedItems = items.map((i) => (i.id === itemId ? updatedItem : i));
    setItems(assignLanes(updatedItems));
}


export const getFixedColumnWidth = (zoomLevel: string): number => {
    switch (zoomLevel) {
        case 'day': return 60;
        case 'week': return 180;
        case 'month': return 240;
        default: return 60;
    }
};