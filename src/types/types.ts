export type TimelineItem = {
    id: number;
    name: string;
    start: string;
    end: string;
    lane?: number;
};

export type ZoomLevel = 'day' | 'week' | 'month';
