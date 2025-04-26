import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { THEME } from '../../theme';

// Props interface
interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  thickness?: number;
  secondaryColor?: string;
  speed?: number;
  type?: 'circular' | 'dots' | 'pulse';
  label?: string;
}

// Keyframes for animations
const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
`;

// Styled components
const SpinnerContainer = styled.div<{ size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`;

const CircularSpinner = styled.div<{
  size: number;
  thickness: number;
  color: string;
  secondaryColor: string;
  speed: number;
}>`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  
  &::before {
    content: '';
    box-sizing: border-box;
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: ${props => props.thickness}px solid ${props => props.secondaryColor};
  }
  
  &::after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: ${props => props.thickness}px solid transparent;
    border-top-color: ${props => props.color};
    animation: ${rotate} ${props => props.speed}s linear infinite;
  }
`;

const DotsContainer = styled.div<{ size: number }>`
  display: flex;
  justify-content: space-between;
  width: ${props => props.size}px;
  height: ${props => props.size / 3}px;
`;

const Dot = styled.div<{
  size: number;
  color: string;
  index: number;
  speed: number;
}>`
  width: ${props => props.size / 3 - props.size / 15}px;
  height: ${props => props.size / 3 - props.size / 15}px;
  background-color: ${props => props.color};
  border-radius: 50%;
  animation: ${bounce} ${props => props.speed}s infinite ease-in-out both;
  animation-delay: ${props => props.index * 0.16}s;
`;

const PulseSpinner = styled.div<{
  size: number;
  color: string;
  speed: number;
}>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-color: ${props => props.color};
  border-radius: 50%;
  animation: ${pulse} ${props => props.speed}s infinite ease-in-out;
  opacity: 0.7;
`;

const SpinnerLabel = styled.div<{ size: number }>`
  margin-top: ${props => props.size / 5}px;
  font-size: ${props => Math.max(12, props.size / 3)}px;
  color: ${THEME.textColor};
  opacity: 0.7;
  font-weight: 500;
`;

const SpinnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// Component
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = THEME.primaryColor || '#4a7bec',
  thickness = 3,
  secondaryColor = 'rgba(255, 255, 255, 0.1)',
  speed = 1.2,
  type = 'circular',
  label
}) => {
  // Adjust thickness based on size
  const adjustedThickness = Math.max(2, Math.round(size / 15));
  
  return (
    <SpinnerWrapper>
      <SpinnerContainer size={size}>
        {type === 'circular' && (
          <CircularSpinner
            size={size}
            thickness={thickness || adjustedThickness}
            color={color}
            secondaryColor={secondaryColor}
            speed={speed}
          />
        )}
        
        {type === 'dots' && (
          <DotsContainer size={size}>
            {[0, 1, 2].map(i => (
              <Dot key={i} size={size} color={color} index={i} speed={speed} />
            ))}
          </DotsContainer>
        )}
        
        {type === 'pulse' && (
          <PulseSpinner size={size} color={color} speed={speed} />
        )}
      </SpinnerContainer>
      
      {label && <SpinnerLabel size={size}>{label}</SpinnerLabel>}
    </SpinnerWrapper>
  );
};

export default LoadingSpinner;