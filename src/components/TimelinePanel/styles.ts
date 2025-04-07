import styled from "styled-components";

export const ItemsPanel = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: -50px;
  margin-top: 34px;
  width: 280px;
  min-width: 280px;
  max-height: ;  
  border-left: 1px solid #e0e0e0;
  background-color: #f9f9f9;
  overflow-y: auto;
  padding: 0 16px;
`;

export const ItemCard = styled.div<{ selected?: boolean }>`
  padding: 6px;
  margin-bottom: 6px;
  background-color: ${props => props.selected ? '#e3f2fd' : 'white'};
  border: 1px solid ${props => props.selected ? '#2196f3' : '#e0e0e0'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #2196f3;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

export const ItemTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

export const ItemDates = styled.div`
  font-size: 12px;
  color: #666;
`;