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

  border-radius: ${theme.radius.md};

`;

export const TimelineControls = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: white;
`;

export const ZoomButton = styled.button<{ active: boolean }>`
  margin-right: 8px;
  background-color: ${props => props.active ? theme.colors.primary.main : theme.colors.neutral[200]};
  color: ${props => props.active ? 'white' : theme.colors.neutral[700]};
  border: none;
  padding: 10px 14px;
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
  border-radius: ${theme.radius.md};
  border: 1px solid ${theme.colors.neutral[500]};
  background-color: white;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;

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
  margin-left: 2px;

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