import styled from 'styled-components';

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
  width: 100%; // Ocupa toda a largura disponível
  max-width: 100%; // Evita ultrapassar o contêiner pai
  box-sizing: border-box;

  &::-webkit-scrollbar {
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 5px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

export const TimelineHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 20;
`;

export const HeaderLabel = styled.div`
  min-width: 101px;
  padding: 10px;
  font-weight: bold;
  border-right: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
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

export const LanesColumn = styled.div`
  min-width: 100px;
  padding: 10px;
  border-right: 1px solid #e0e0e0;
  height: 60px;
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
`;

export const LaneLabel = styled.div<{ isLast: boolean }>`
  padding: 10px 5px;
  box-sizing: border-box;
  border-bottom: ${props => !props.isLast ? '1px solid #f0f0f0' : 'none'};
  display: flex;
  align-items: center;
  min-height: 60px;
  flex: 1;
`;


// Atualização do TimelineGrid para melhor apresentação
export const TimelineGrid = styled.div`
  position: relative;
  flex: 1;
  background: linear-gradient(to bottom, #ffffff, #fafafa);
  //min-height: 300px;
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

export const LaneNameInput = styled.input`
  flex: 1;
  padding: 2px 4px;
  font-size: 14px;
  border: 1px solid #3498db;
  border-radius: 3px;
  outline: none;
  margin-right: 5px;
`;

export const LaneActions = styled.div`
  display: flex;
  gap: 4px;
`;

export const EditButton = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #7f8c8d;
  padding: 2px 5px;
  font-size: 12px;
  visibility: hidden;

  ${LaneLabel}:hover & {
    visibility: visible;
  }

  &:hover {
    color: #3498db;
  }
`;

export const SaveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #27ae60;
  font-weight: bold;
  
  &:hover {
    color: #2ecc71;
  }
`;

export const CancelButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #e74c3c;
  font-weight: bold;
  
  &:hover {
    color: #c0392b;
  }
`;

export const EmptyCell = styled.div`
  position: absolute;
  background-color: #f5f5f5;
  z-index: 1;
`;

// Adicione estes componentes ao arquivo styles.ts

export const CursorNavigationControls = styled.div`
    display: flex;
    margin-left: 20px;
    gap: 10px;
`;

export const CursorNavigationButton = styled.button`
    background: #2c3e50;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
    
    &:hover {
        background: #34495e;
    }
    
    &:active {
        background: #1a2530;
    }
`;

export const CursorIndicator = styled.div`
    position: absolute;
    width: 2px;
    background: rgba(255, 0, 0, 0.7);
    z-index: 15;
    top: 0;
    pointer-events: none;
    box-shadow: 0 0 8px rgba(255, 0, 0, 0.5);
    
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: -4px;
        width: 10px;
        height: 10px;
        background: red;
        border-radius: 50%;
    }
`;