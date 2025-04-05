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
    background: #4a90e2;
    border-radius: 4px;
    padding: 4px 8px;
    color: white;
    font-size: 12px;
    cursor: pointer;
    box-sizing: border-box;
    transition: all 0.3s ease; // Transição suave para todas as propriedades animáveis
    z-index: 10;
    min-width: 40px; // Largura mínima inicial para evitar que fique muito pequeno

    &:hover {
        min-width: 200px; // Largura mínima no hover
        background: #357abd; // Fundo mais escuro
        z-index: 20; // Fica acima de outros itens
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); // Sombra sutil
        white-space: normal; // Permite quebra de linha
        overflow: visible; // Garante que o texto expandido seja visível
    }
`;

export const ItemContent = styled.div`
    display: flex;
    flex-direction: column;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; // Normalmente truncado

    ${ItemContainer}:hover & {
        white-space: normal; // No hover, permite texto completo
        overflow: visible;
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