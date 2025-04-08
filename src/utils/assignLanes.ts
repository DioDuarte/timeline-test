
import { TimelineItem } from '../types/types';

export const assignLanes = (items: TimelineItem[]): TimelineItem[] => {
    if (!items.length) return [];

    const sortedItems = [...items].sort((a, b) => {
        const startA = new Date(a.start).getTime();
        const startB = new Date(b.start).getTime();
        return startA - startB;
    });

    const itemsWithLanes: TimelineItem[] = [];

    const laneTracks: number[] = [];

    sortedItems.forEach(item => {
        const itemStart = new Date(item.start).getTime();
        const itemEnd = new Date(item.end).getTime();


        let laneIndex = 0;
        let foundLane = false;

        while (!foundLane && laneIndex < laneTracks.length) {
            if (laneTracks[laneIndex] < itemStart) {
                foundLane = true;
                laneTracks[laneIndex] = itemEnd;
            } else {
                laneIndex++;
            }
        }

        if (!foundLane) {
            laneTracks.push(itemEnd);
        }

        itemsWithLanes.push({
            ...item,
            lane: laneIndex
        });
    });

    return itemsWithLanes;
};