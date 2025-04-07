import styled from "styled-components";
import {theme} from "../../theme/theme";

export const PanelTitle = styled.div`
    margin-top: 21px;
    font-size: 18px;
    font-weight: 500;
`

export const ItemsPanel = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: -10px;
  margin-top: 0px;
  border-radius: ${theme.radius.md};
  border-top: 1px solid ${theme.colors.neutral[500]};
  width: 280px;
  min-width: 280px;
  border-left: 1px solid ${theme.colors.neutral[500]};
  border-bottom: 1px solid ${theme.colors.neutral[500]};
  background-color: #f9f9f9;
  overflow-y: auto;
  padding: 10px 16px 0 16px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
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