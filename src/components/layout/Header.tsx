import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// Animation keyframes
const glowPulse = keyframes`
  0% { box-shadow: 0 0 8px rgba(80, 100, 255, 0.2), 0 0 4px rgba(80, 100, 255, 0.1); }
  50% { box-shadow: 0 0 16px rgba(80, 100, 255, 0.4), 0 0 8px rgba(80, 100, 255, 0.2); }
  100% { box-shadow: 0 0 8px rgba(80, 100, 255, 0.2), 0 0 4px rgba(80, 100, 255, 0.1); }
`;


const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Improved container with centered alignment
const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  width: 100%;
  padding: 10px 0;
  animation: ${fadeIn} 0.6s ease-out forwards;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 15px;
  }
`;

// Enhanced logo that matches the database explorer theme
const LogoContainer = styled.div`
  position: relative;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #445bff, #5e44ff);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: ${glowPulse} 3s infinite ease-in-out;
  flex-shrink: 0;
  
  // Overlay grid pattern for vector database theme
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 15px 15px;
    border-radius: 16px;
    opacity: 0.2;
  }
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

// Animated icon with specialized vector database indicator
const IconSvg = styled.svg`
  width: 36px;
  height: 36px;
  fill: none;
  stroke: white;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  z-index: 2;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.4));
`;

// Better text container that aligns with the logo vertically centered
const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: ${fadeIn} 0.6s ease-out forwards;
  animation-delay: 0.2s;
  opacity: 0;
  animation-fill-mode: forwards;
`;

const Title = styled.h1`
  margin: 0 0 6px 0;
  padding: 0;
  font-size: 2.2rem;
  font-weight: 600;
  color: white;
  line-height: 1.2;
  letter-spacing: -0.01em;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.6rem;
  }
`;

const Subtitle = styled.p`
  margin: 0;
  padding: 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  max-width: 500px;
  animation: ${fadeIn} 0.6s ease-out forwards;
  animation-delay: 0.4s;
  opacity: 0;
  animation-fill-mode: forwards;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;




// Nodes animation for vector database concept
const Node = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  background-color: white;
  border-radius: 50%;
  opacity: 0.8;
`;

const ConnectionLine = styled.div`
  position: absolute;
  background-color: rgba(255, 255, 255, 0.4);
  height: 1px;
  transform-origin: 0% 50%;
`;

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const logoRef = useRef<HTMLDivElement>(null);
  
  // Generate random nodes for the logo
  const nodes = [
    { x: 25, y: 25 },
    { x: 45, y: 20 },
    { x: 20, y: 45 },
    { x: 50, y: 50 },
    { x: 35, y: 35 }
  ];
  
  // Connections between nodes
  const connections = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 4 }
  ];
  
  useEffect(() => {
    
    // Apply animations to nodes
    const nodeElements = document.querySelectorAll('.vector-node');
    nodeElements.forEach((node, index) => {
      if (node instanceof HTMLElement) {
        node.animate([
          { opacity: 0, transform: 'scale(0)' },
          { opacity: 0.8, transform: 'scale(1)' }
        ], {
          duration: 600,
          delay: 200 + (index * 150),
          fill: 'forwards',
          easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
        });
      }
    });
    
    // Apply animations to connections
    const connectionElements = document.querySelectorAll('.vector-connection');
    connectionElements.forEach((conn, index) => {
      if (conn instanceof HTMLElement) {
        const angle = conn.getAttribute('data-angle');
        conn.animate([
          { opacity: 0, transform: `scaleX(0) rotate(${angle}deg)` },
          { opacity: 0.4, transform: `scaleX(1) rotate(${angle}deg)` }
        ], {
          duration: 800,
          delay: 600 + (index * 120),
          fill: 'forwards',
          easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
        });
      }
    });
  }, []);
  
  // Calculate angle between two points
  const getAngle = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  };
  
  // Calculate distance between two points
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };
  
  // Vector database logo with chart/analytics elements
  const vectorLogoPath = (
    <>
      {/* Chart line */}
      <polyline 
        points="8,36 16,28 24,30 32,18 42,24" 
        stroke="white" 
        strokeWidth="2.5" 
        fill="none" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Data point markers */}
      <circle cx="16" cy="28" r="3" fill="white" />
      <circle cx="32" cy="18" r="3" fill="white" />
      
      {/* Vector grid indicators */}
      <line x1="8" y1="8" x2="8" y2="42" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="42" y1="8" x2="42" y2="42" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="8" y1="42" x2="42" y2="42" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
      
      {/* Database indicator */}
      <path 
        d="M25,8 Q42,8 42,14 V20 Q42,26 25,26 Q8,26 8,20 V14 Q8,8 25,8 Z" 
        fill="none" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeOpacity="0.6"
      />
      <ellipse cx="25" cy="14" rx="17" ry="6" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.6" />
    </>
  );

  return (
    <HeaderContainer className={className}>
      <LogoContainer ref={logoRef}>
        <IconSvg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
          {vectorLogoPath}
        </IconSvg>
        
        {/* Vector nodes visualization */}
        {nodes.map((node, index) => (
          <Node 
            key={`node-${index}`}
            className="vector-node"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              opacity: 0
            }}
          />
        ))}
        
        {/* Connection lines between nodes */}
        {connections.map((conn, index) => {
          const fromNode = nodes[conn.from];
          const toNode = nodes[conn.to];
          const angle = getAngle(fromNode.x, fromNode.y, toNode.x, toNode.y);
          const distance = getDistance(fromNode.x, fromNode.y, toNode.x, toNode.y);
          
          return (
            <ConnectionLine 
              key={`connection-${index}`}
              className="vector-connection"
              data-angle={angle}
              style={{
                left: `${fromNode.x}%`,
                top: `${fromNode.y}%`,
                width: `${distance}%`,
                transform: `rotate(${angle}deg)`,
                opacity: 0
              }}
            />
          );
        })}
      </LogoContainer>
      
      <TextContainer>
        <Title>Vector Database Explorer</Title>
        <Subtitle>
          Create, index, and search vector embeddings in a unified interface
        </Subtitle>
        

      </TextContainer>
    </HeaderContainer>
  );
};

export default Header;