import {useLocalization} from "../../context/LocalizationContext";
import React, {useState} from 'react';
import { TimelineItem as TimelineItemType } from '../../types/types';
import { format, parseISO } from 'date-fns';
import {ItemsPanel, ItemCard, ItemTitle, ItemDates, PanelTitle} from './styles';
import { useSyncHeight } from '../../hooks/useSyncHeight';
import {ptBR} from "date-fns/locale";

interface ItemsListPanelProps {
    items: TimelineItemType[];
    selectedItemId?: number;
    onItemSelect: (item: TimelineItemType) => void;
    timelineRef: React.RefObject<HTMLElement | null>;
    onItemHover?: (itemId: number | null) => void;
}

const ItemsListPanel: React.FC<ItemsListPanelProps> = ({
                                                           items,
                                                           selectedItemId,
                                                           onItemSelect,
                                                           timelineRef,
                                                           onItemHover
                                                       }) => {

    const panelHeight = useSyncHeight(timelineRef);
    const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);
    const { locale, t} = useLocalization();
    const dateFormat = locale === ptBR ? 'dd/MM/yyyy' : 'MM/dd/yyyy';

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <PanelTitle>{t('panelTitle')}</PanelTitle>
            <ItemsPanel style={{height: `calc(${panelHeight} - 10px)`}}>
                {items
                    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
                    .map((item) => (
                        <ItemCard
                            key={item.id}
                            selected={item.id === selectedItemId}
                            onClick={() => onItemSelect(item)}
                            onMouseEnter={() => {
                                setHoveredItemId(item.id);
                                onItemHover?.(item.id);
                            }}
                            onMouseLeave={() => {
                                setHoveredItemId(null);
                                onItemHover?.(null);
                            }}
                        >
                            <ItemTitle>{item.name}</ItemTitle>
                            <ItemDates>
                                {format(parseISO(item.start), dateFormat, {locale})} - {format(parseISO(item.end), dateFormat, {locale})}
                            </ItemDates>
                        </ItemCard>
                    ))}
            </ItemsPanel>
        </div>

    );
};

export default ItemsListPanel;