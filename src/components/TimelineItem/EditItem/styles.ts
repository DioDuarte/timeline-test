import styled from 'styled-components';

export const ModalContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    cursor: default;
    backdrop-filter: blur(3px);
    animation: fadeIn 0.3s ease-out;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

export const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    border-radius: 12px;;
    width: 450px;
    max-width: 95%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    pointer-events: auto;
    cursor: default;
    overflow: hidden;
    transform: translateY(0);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
    }
`;

export const ModalHeader = styled.div`
    padding: 20px 24px;
    margin-bottom: 20px;
    width: 100%;
    background: #3498db;
    color: white;
`;

export const ModalTitle = styled.h3`
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: white;
`;

export const ModalBody = styled.div`
    width: 80%;
`;

export const ModalFooter = styled.div`
    width: 90%;
    padding: 16px 24px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    background: #f9f9f9;
`;

export const InputField = styled.div`
    margin-bottom: 20px;

    label {
        display: flex;
        margin-left: 25px;
        margin-bottom: 8px;
        font-weight: 500;
        color: #555;
        font-size: 0.9rem;
    }

    input {
        width: 85%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
        transition: border 0.3s, box-shadow 0.3s;

        &:focus {
            border-color: #3498db;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
            outline: none;
        }
    }
`;

export const DateInput = styled.input`
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    transition: border 0.3s, box-shadow 0.3s;

    &:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        outline: none;
    }
`;

export const Button = styled.button<{ primary?: boolean }>`
    padding: 10px 18px;
    border: none;
    border-radius: 6px;
    background-color: ${(props) => (props.primary ? '#3498db' : '#f0f0f0')};
    color: ${(props) => (props.primary ? 'white' : '#555')};
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &:hover {
        background-color: ${(props) => (props.primary ? '#2980b9' : '#e0e0e0')};
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }

    svg {
        width: 14px;
        height: 14px;
    }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;