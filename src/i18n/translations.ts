import { enUS, ptBR } from 'date-fns/locale';
import {Locale} from "date-fns";

export type Language = 'pt' | 'en';

export interface Translations {
    [key: string]: string;
}

export const locales: Record<Language, Locale> = {
    pt: ptBR,
    en: enUS,
};

export const translations: Record<Language, Translations> = {
    pt: {
        // TimelineControlsComponent
        day: 'Dia',
        week: 'Semana',
        month: 'Mês',
        removeReferencePoint: 'Remover Ponto de Referência',

        // TimelineInstructions
        instructions: 'Instruções:',
        dragItems: 'Arraste itens horizontalmente para reposicioná-los no tempo',
        dragTimeline: 'Arraste a timeline com o mouse para navegar pelas datas',
        zoomButtons: 'Use os botões de zoom ou role o mouse com Alt pressionado para mudar a visualização',
        doubleClickDate: 'Clique duplo em qualquer data para criar um ponto de referência para zoom',
        doubleClickEvent: 'Clique duplo em qualquer evento da timeline abrirá o modal de edição de eventos',
        quickNavPanel: 'Na direita há o painel de navegação rápida',
        selectEvent: 'Selecionar qualquer evento o posicionará no centro da timeline com uma cor diferente para facilitar a visualização.',

        // EditItemModal
        editItem: 'Editar Item',
        itemName: 'Nome do Item',
        startDate: 'Data de Início',
        endDate: 'Data de Fim',
        cancel: 'Cancelar',
        saveChanges: 'Salvar Alterações',

        // TimelinePanel
        panelTitle: 'Lista de Eventos/Navegação Rápida',
    },
    en: {
        // TimelineControlsComponent
        day: 'Day',
        week: 'Week',
        month: 'Month',
        removeReferencePoint: 'Remove Reference Point',

        // TimelineInstructions
        instructions: 'Instructions:',
        dragItems: 'Drag events horizontally to reposition them in time',
        dragTimeline: 'Drag the timeline with the mouse to navigate through dates',
        zoomButtons: 'Use the zoom buttons or scroll the mouse with Alt pressed to change the view',
        doubleClickDate: 'Double-click any date to create a zoom reference point',
        doubleClickEvent: 'Double-click any timeline event to open the event editing modal',
        quickNavPanel: 'On the right you can easily navigate through the events',
        selectEvent: 'Selecting any event from the event list will center it on the timeline with a different color for easier visualization.',

        // EditItemModal
        editItem: 'Edit Item',
        itemName: 'Item Name',
        startDate: 'Start Date',
        endDate: 'End Date',
        cancel: 'Cancel',
        saveChanges: 'Save Changes',

        // TimelinePanel
        panelTitle: 'Event List/Quick Navigation',
    },
};