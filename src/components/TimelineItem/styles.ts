import styled from 'styled-components';
import { theme } from '../../theme/theme';

export const ItemContainer = styled.div`
  position: absolute;
  background: ${theme.colors.timeline.item};
  border-radius: ${theme.radius.sm};
  padding: 6px 10px;
  color: white;
  font-size: 12px;
  cursor: grab;
  box-sizing: border-box;
  z-index: 10;
  min-width: 40px;
  width: auto;
  height: 40px;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  justify-content: flex-start;
  box-shadow: ${theme.shadows.sm};
  backdrop-filter: blur(5px);

  transition: all ${theme.transitions.normal};

  &[data-has-space="true"] {
    justify-content: center;
  }

  &:hover:not([data-dragging="true"]) {
    min-width: 200px;
    background: ${theme.colors.timeline.itemHover};
    z-index: 20;
    box-shadow: ${theme.shadows.md};
    transform: translateY(-2px) scale(1.01);
    justify-content: center;
  }

  &[data-hovered="true"]:not([data-dragging="true"]) {
    background: ${theme.colors.timeline.itemHover};
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-3px) scale(1.02);
    z-index: 25;
  }

  &[data-selected="true"]:not([data-dragging="true"]) {
    background: ${theme.colors.timeline.itemSelected};
    box-shadow: 0 4px 12px rgba(142, 68, 173, 0.3);
    transform: translateY(-2px);
    z-index: 30;
  }

  &[data-dragging="true"],
  &:active {
    cursor: grabbing;
    min-width: 40px;
    background: ${theme.colors.timeline.item};
    white-space: nowrap;
    overflow: hidden;
    box-shadow: ${theme.shadows.lg};
    transform: translateY(0) scale(1.03);
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
  transition: all ${theme.transitions.fast};
  align-items: flex-start;
  text-align: left;

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