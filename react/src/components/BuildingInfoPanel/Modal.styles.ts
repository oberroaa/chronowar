import styled from 'styled-components';
import { type StyledProps } from './types';

// Fondo del modal
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.3s forwards;

  @keyframes fadeIn {
    to { opacity: 1; }
  }
`;

// Contenedor principal del modal
export const ModalContainer = styled.div<StyledProps>`
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(
    to right bottom,
    rgba(0, 0, 0, 0.9),
    ${props => props.$darkColor + '99'}
  );
  border: 3px solid ${props => props.$secondaryColor};
  border-radius: 15px;
  padding: 25px;
  color: white;
  box-shadow: 0 0 30px ${props => props.$primaryColor};
  position: relative;
  transform: scale(0.9);
  animation: scaleIn 0.2s 0.1s forwards;

  @keyframes scaleIn {
    to { transform: scale(1); }
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.$secondaryColor};
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    width: 95%;
    padding: 15px;
  }
`;

// Botón de cerrar
export const CloseButton = styled.button<{ $secondaryColor: string; $primaryColor: string }>`
  position: absolute;
  right: 15px;
  top: 15px;
  background: none;
  border: none;
  color: ${props => props.$secondaryColor};
  font-size: 2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$primaryColor + '20'};
    transform: rotate(90deg);
  }
`;