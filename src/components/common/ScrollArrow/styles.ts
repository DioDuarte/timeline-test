import styled from "styled-components";

export const ScrollArrow = styled.div<{ direction: 'left' | 'right' }>`
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
  transition: opacity 0.3s ease;

  ${({ direction }) => direction === 'left' ? `
    &::after {
      content: '◄';
      color: white;
      font-size: 12px;
    }
  ` : `
    &::after {
      content: '►';
      color: white;
      font-size: 12px;
    }
  `}

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;