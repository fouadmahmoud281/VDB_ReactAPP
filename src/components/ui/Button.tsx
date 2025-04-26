import styled from '@emotion/styled';
import { THEME } from '../../theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outlined';
  fullWidth?: boolean;
}

const Button = styled.button<ButtonProps>`
  border-radius: 5px;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0.6em 1.2em;
  font-size: 1em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  ${props => props.variant === 'primary' && `
    background-color: ${THEME.primaryColor};
    color: white;
    border: none;
  `}
  
  ${props => props.variant === 'secondary' && `
    background-color: ${THEME.secondaryBgColor};
    color: ${THEME.textColor};
    border: 1px solid rgba(255, 255, 255, 0.1);
  `}
  
  ${props => props.variant === 'outlined' && `
    background-color: transparent;
    color: ${THEME.primaryColor};
    border: 1px solid ${THEME.primaryColor};
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export default Button;