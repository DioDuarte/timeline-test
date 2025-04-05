// src/utils/assignLanes.ts
import { TimelineItem } from '../types/types';

export const assignLanes = (items: TimelineItem[]): TimelineItem[] => {
    if (!items.length) return [];

    // Ordenar os itens por data de início
    const sortedItems = [...items].sort((a, b) => {
        const startA = new Date(a.start).getTime();
        const startB = new Date(b.start).getTime();
        return startA - startB;
    });

    // Criar array para armazenar os itens com lanes atribuídas
    const itemsWithLanes: TimelineItem[] = [];

    // Array para rastrear o fim de cada lane
    const laneTracks: number[] = [];

    // Processar cada item e atribuir uma lane apropriada
    sortedItems.forEach(item => {
        const itemStart = new Date(item.start).getTime();
        const itemEnd = new Date(item.end).getTime();

        // Verificar cada lane existente para ver se o item pode ser colocado nela
        let laneIndex = 0;
        let foundLane = false;

        while (!foundLane && laneIndex < laneTracks.length) {
            // Se o final da última tarefa nesta lane for antes do início deste item
            if (laneTracks[laneIndex] < itemStart) {
                foundLane = true;
                // Atualizar o final da lane com o fim desse item
                laneTracks[laneIndex] = itemEnd;
            } else {
                // Tentar a próxima lane
                laneIndex++;
            }
        }

        // Se não encontrou uma lane livre, cria uma nova
        if (!foundLane) {
            laneTracks.push(itemEnd);
        }

        // Adicionar o item com a lane atribuída
        itemsWithLanes.push({
            ...item,
            lane: laneIndex
        });
    });

    console.log('Assigned lanes:', itemsWithLanes);
    return itemsWithLanes;
};