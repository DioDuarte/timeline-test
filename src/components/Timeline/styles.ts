import styled from 'styled-components';

export const TimelineWrapper = styled.div`
  display: flex;
  gap: 40px;
  justify-content: space-between;
  width: 100%;
  height: 100%;
`;


// Componentes Estilizados
export const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
`;

export const TimelineControls = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

export const ZoomButton = styled.button<{ active: boolean }>`
  margin-right: 5px;
  background-color: ${props => props.active ? '#3498db' : '#e0e0e0'};
  color: ${props => props.active ? 'white' : 'black'};
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;

  &:last-child {
    margin-right: 0;
  }
`;

export const ScrollContainer = styled.div`
  position: relative;
  overflow: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
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
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 20;
  transition: width 0.2s ease-out; // Adiciona transição suave
`;

export const DateHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: visible; // Alterado de hidden para visible
  position: relative;

  .month-row {
    position: relative;
    height: 20px;
    width: 100%;
  }

  .date-row {
    display: flex;
    width: 100%;
  }

  .month-label {
    position: absolute;
    font-weight: bold;
    font-size: 12px;
    padding: 2px 0;
    border-left: 1px solid #ccc;
  }
`;

export const DateHeaderCell = styled.div<{ isLast: boolean; isWeekend: boolean }>`
  text-align: center;
  padding: 5px 0;
  border-right: ${props => (props.isLast ? 'none' : '1px solid #e0e0e0')};
  background-color: ${props => (props.isWeekend ? '#f5f5f5' : 'white')};
  font-size: 12px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  flex-shrink: 0; // Impede que as células encolham
  flex-grow: 0; // Impede que as células cresçam

  .day-of-week {
    font-size: 10px;
    font-weight: normal;
    margin-top: 2px;
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
  background: linear-gradient(to bottom, #ffffff, #fafafa);
  transition: width 0.2s ease-out; // Adiciona transição suave
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
      props.isMonthStart ? '#aaa' :
          props.isWeekend ? '#e9ecef' : '#e0e0e0'};
  z-index: ${props => props.isMonthStart ? 2 : 1};
`;

export const HorizontalGridLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  height: 1px;
  background-color: #f0f0f0;
`;

export const Instructions = styled.div`
  margin-top: 20px;
  font-size: 14px;
  color: #666;
`;

export const Sentinel = styled.div`
    width: 1px;
    height: 100%;
    position: absolute;
    pointer-events: none;
`;