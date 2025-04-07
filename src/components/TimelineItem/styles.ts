// src/components/TimelineItem/styles.ts
import styled from 'styled-components';

export const TimelineItemWrapper = styled.div<{
    left: number;
    top: number;
    width: number;
    height: number;
}>`
  position: absolute;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  width: ${props => Math.max(props.width, 80)}px; // Ensure minimum width for very short events
  height: ${props => props.height}px;
  background-color: #3498db;
  border-radius: 4px;
  padding: 4px 8px;
  box-sizing: border-box;
  color: white;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: move;
  user-select: none;
  z-index: 1;
`;

export const ItemContainer = styled.div`
    position: absolute;
    background: #4a90e2; // Cor padrão
    border-radius: 4px;
    padding: 4px 8px;
    color: white;
    font-size: 12px;
    cursor: grab;
    box-sizing: border-box;
    z-index: 10;
    min-width: 40px;
    width: auto;
    height: 50px;
    display: flex;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
    justify-content: flex-start;

    transition: min-width 0.2s ease-out,
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;

    &[data-has-space="true"] {
        justify-content: center;
    }

    &:hover:not([data-dragging="true"]) {
        min-width: 200px;
        background: #357abd; // Hover padrão ao passar o mouse diretamente no item
        z-index: 20;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
        justify-content: center;
    }

    &[data-hovered="true"]:not([data-dragging="true"]) {
        background: #1d6da1; // Roxo vibrante para hover vindo do TimelinePanel
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-4px);
        z-index: 25;
    }

    &[data-selected="true"]:not([data-dragging="true"]) {
        background: #8e44ad; // Azul escuro para item selecionado
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
        z-index: 30;
    }

    &[data-dragging="true"],
    &:active {
        cursor: grabbing;
        min-width: 40px;
        background: #4a90e2;
        white-space: nowrap;
        overflow: hidden;
        box-shadow: none;
        transform: translateY(0);
        transition: none;
        justify-content: flex-start;
    }
`;

export const ItemContent = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: all 0.2s ease;
    /* Alinhamento padrão à esquerda */
    align-items: flex-start;
    text-align: left;

    /* Centraliza quando tem espaço suficiente */
    ${ItemContainer}[data-has-space="true"] & {
        align-items: center;
        text-align: center;
    }

    ${ItemContainer}:hover:not([data-dragging="true"]) & {
        white-space: normal;
        overflow: visible;
        align-items: center;
        text-align: center;
    }

    ${ItemContainer}[data-dragging="true"] &,
    ${ItemContainer}:active & {
        white-space: nowrap;
        overflow: hidden;
        align-items: flex-start;
        text-align: left;
        transition: none;
    }
`;

export const ItemInput = styled.input`
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  color: white;
  outline: none;
  padding: 0;
  margin: 0;
  font-size: inherit;
`;

export const ResizeHandleLeft = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    width: 5px;
    height: 100%;
    cursor: w-resize;
`;

export const ResizeHandleRight = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    width: 5px;
    height: 100%;
    cursor: e-resize;
`;