// src/components/Timeline/styles.ts
import styled from 'styled-components';
import { theme } from '../../theme/theme';

export const TimelineWrapper = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
  height: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

export const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  background-color: ${theme.colors.background};
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadows.md};
`;

export const TimelineControls = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: white;
  border-bottom: 1px solid ${theme.colors.neutral[200]};
  border-radius: ${theme.radius.md} ${theme.radius.md} 0 0;
`;

export const ZoomButton = styled.button<{ active: boolean }>`
  margin-right: 8px;
  background-color: ${props => props.active ? theme.colors.primary.main : theme.colors.neutral[200]};
  color: ${props => props.active ? 'white' : theme.colors.neutral[700]};
  border: none;
  padding: 6px 12px;
  border-radius: ${theme.radius.sm};
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  transition: all ${theme.transitions.fast};

  &:hover {
    background-color: ${props => props.active ? theme.colors.primary.dark : theme.colors.neutral[300]};
  }

  &:last-child {
    margin-right: 0;
  }
`;

export const ScrollContainer = styled.div`
  position: relative;
  overflow: auto;
  border-radius: 0 0 ${theme.radius.md} ${theme.radius.md};
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
  background-color: white;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const TimelineHeader = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.neutral[300]};
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 20;
  transition: width ${theme.transitions.normal};
`;

export const DateHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: visible;
  position: relative;

  .date-row {
    display: flex;
    width: 100%;
  }
`;

export const DateHeaderCell = styled.div<{ isLast: boolean; isWeekend: boolean }>`
  text-align: center;
  padding: 8px 0;
  border-right: ${props => (props.isLast ? 'none' : `1px solid ${theme.colors.neutral[200]}`)};
  background-color: ${props => (props.isWeekend ? theme.colors.timeline.weekend : 'white')};
  font-size: 12px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  flex-shrink: 0;
  flex-grow: 0;
  color: ${theme.colors.neutral[700]};

  .day-of-week {
    font-size: 10px;
    font-weight: 400;
    margin-top: 2px;
    color: ${theme.colors.neutral[600]};
  }
`;

export const TimelineBody = styled.div`
  display: flex;
  position: relative;
  flex: 1;
`;

export const TimelineGrid = styled.div`
  position: relative;
  flex: 1;
  background: white;
  transition: width ${theme.transitions.normal};
`;

export const VerticalGridLine = styled.div<{
  isWeekend?: boolean,
  isMonthStart?: boolean
}>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  height: 100%;
  background-color: ${props =>
      props.isMonthStart ? theme.colors.timeline.monthLine :
          props.isWeekend ? theme.colors.timeline.line : theme.colors.neutral[200]};
  z-index: ${props => props.isMonthStart ? 2 : 1};
`;

export const HorizontalGridLine = styled.div<{ totalWidth?: number }>`
  position: absolute;
  left: 0;
  width: ${props => props.totalWidth ? `${props.totalWidth}px` : '100%'};
  height: 1px;
  background-color: ${theme.colors.neutral[200]};
`;

export const Instructions = styled.div`
  margin-top: 12px;
  font-size: 13px;
  color: ${theme.colors.neutral[600]};
  padding: 0 16px 12px;
`;

export const Sentinel = styled.div`
  width: 1px;
  height: 100%;
  position: absolute;
  pointer-events: none;
`;

export const FocusIndicator = styled.div<{ left: number; isActive: boolean }>`
  position: absolute;
  left: ${props => props.left}px;
  top: 0;
  height: 100%;
  width: 2px;
  background-color: ${theme.colors.timeline.focus};
  z-index: 10;
  opacity: ${props => props.isActive ? 0.8 : 0};
  transition: opacity ${theme.transitions.normal};
  box-shadow: 0 0 8px rgba(255, 107, 107, 0.8);

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -5px;
    width: 12px;
    height: 12px;
    background-color: ${theme.colors.timeline.focus};
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(255, 107, 107, 0.8);
  }
`;

export const FocusTooltip = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: -40px;
  left: -50px;
  width: 100px;
  background-color: ${theme.colors.neutral[800]};
  color: white;
  border-radius: ${theme.radius.sm};
  padding: 4px 8px;
  font-size: 12px;
  text-align: center;
  opacity: ${props => (props.isVisible ? 1 : 0)};
  transition: opacity ${theme.transitions.normal};
  pointer-events: none;
  z-index: 20;
  white-space: nowrap;
`;