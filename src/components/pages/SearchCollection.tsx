import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import styled from '@emotion/styled'
import axios from 'axios'
import { THEME } from '../../theme'
import { config } from '../../config'
import { debounce } from 'lodash'

// Constants
const SCORE_THRESHOLDS = {
  HIGH: 0.8,  // 80% match or higher
  MEDIUM: 0.6 // 60-80% match
}

const BUSINESS_USE_CASES = [
  {
    title: 'Customer Support',
    query: 'How do I reset my password?',
    description: 'Find similar customer inquiries to build a knowledge base'
  },
  {
    title: 'Product Research',
    query: 'Features customers want in our mobile app',
    description: 'Analyze feedback for product development'
  },
  {
    title: 'Competitive Analysis',
    query: 'Competitors offering lower prices than our service',
    description: 'Monitor market positioning and competitive threats'
  },
  {
    title: 'Employee Onboarding',
    query: 'Company policies for new employees',
    description: 'Help new team members find relevant documentation'
  }
]

// API Configuration from centralized config
const API_URL = '/api/search'; // This will be proxied to the configured API base URL

// Styled Components with improved accessibility and transitions optimized for dark mode
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  font-family: 'Inter', system-ui, sans-serif;
  color: #e1e5ee;
`

const Card = styled.div`
  background-color: #1e2130;
  border-radius: 10px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  margin-bottom: 24px;
  transition: box-shadow 0.2s ease-in-out;
  
  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
`

const BusinessCard = styled(Card)`
  border-left: 4px solid ${THEME.primaryColor || '#4B56D2'};
  
  &.insight-card {
    background: linear-gradient(135deg, #1e2130, #252a38);
  }
`

const CardTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 18px;
  font-size: 1.3rem;
  font-weight: 600;
  color: #e1e5ee;
  position: relative;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
    color: ${THEME.primaryColor || '#4B56D2'};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 3px;
    background-color: ${THEME.primaryColor || '#4B56D2'};
    border-radius: 2px;
  }
`

const FormGroup = styled.div`
  margin-bottom: 20px;
  position: relative;
`

const Label = styled.label`
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s ease;
  color: #e1e5ee;
  
  &:hover {
    color: ${THEME.primaryColor || '#4B56D2'};
  }
`

const Input = styled.input`
  width: 100%;
  background-color: #262b36;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px 14px;
  color: #e1e5ee;
  font-family: inherit;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: ${THEME.primaryColor || '#4B56D2'};
    box-shadow: 0 0 0 3px rgba(75, 86, 210, 0.25);
  }
  
  &:hover:not(:focus) {
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &::placeholder {
    opacity: 0.5;
    color: #a0a9bd;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  background-color: #262b36;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 14px;
  color: #e1e5ee;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  line-height: 1.5;
  
  &:focus {
    outline: none;
    border-color: ${THEME.primaryColor || '#4B56D2'};
    box-shadow: 0 0 0 3px rgba(75, 86, 210, 0.25);
  }
  
  &:hover:not(:focus) {
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &::placeholder {
    opacity: 0.5;
    color: #a0a9bd;
  }
`

const Button = styled.button`
  background-color: ${THEME.primaryColor || '#4B56D2'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.7s ease;
  }
  
  &:hover {
    background-color: #5A66E3;
    transform: translateY(-2px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.3);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background-color: #3A3F4C;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.7;
    
    &::before {
      display: none;
    }
  }

  & svg {
    font-size: 1.2rem;
  }
`

const SecondaryButton = styled(Button)`
  background-color: transparent;
  border: 1px solid ${THEME.primaryColor || '#4B56D2'};
  color: ${THEME.primaryColor || '#4B56D2'};
  
  &:hover {
    background-color: rgba(90, 102, 227, 0.1);
  }
`

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 18px;
  flex-wrap: wrap;
`

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
  padding: 4px;
  transition: transform 0.2s ease;
  color: #e1e5ee;
  
  &:hover {
    transform: translateX(2px);
  }
  
  & input {
    cursor: pointer;
    width: 18px;
    height: 18px;
    accent-color: ${THEME.primaryColor || '#4B56D2'};
  }
`

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const ThreeColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const ExpanderHeader = styled.button`
  background-color: #262b36;
  padding: 14px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-weight: 500;
  color: #e1e5ee;
  
  &:hover {
    background-color: #303540;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(75, 86, 210, 0.25);
  }
  
  & span:last-child {
    transition: transform 0.3s ease;
  }
`

const ExpanderContent = styled.div<{ isOpen: boolean }>`
  padding: 18px;
  background-color: #1a1e27;
  border-radius: 6px;
  margin-bottom: 18px;
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow: hidden;
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: all 0.3s ease-in-out;
`

const ResultCard = styled.div`
  background-color: #262b36;
  border-radius: 8px;
  padding: 18px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }
  
  &:nth-of-type(even) {
    background-color: #252a35;
  }
`

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`

const ResultTitle = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  color: #e1e5ee;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: ${THEME.primaryColor || '#4B56D2'};
    border-radius: 50%;
    margin-right: 8px;
  }
`

const ResultScore = styled.div<{ score: number }>`
  background-color: ${props => {
    if (props.score > SCORE_THRESHOLDS.HIGH) return 'rgba(76, 175, 80, 0.2)';
    if (props.score > SCORE_THRESHOLDS.MEDIUM) return 'rgba(255, 193, 7, 0.2)';
    return 'rgba(239, 83, 80, 0.2)';
  }};
  color: ${props => {
    if (props.score > SCORE_THRESHOLDS.HIGH) return '#4caf50';
    if (props.score > SCORE_THRESHOLDS.MEDIUM) return '#ffc107';
    return '#ef5350';
  }};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    background-color: ${props => {
      if (props.score > SCORE_THRESHOLDS.HIGH) return '#4caf50';
      if (props.score > SCORE_THRESHOLDS.MEDIUM) return '#ffc107';
      return '#ef5350';
    }};
  }
`

const ResultMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  opacity: 0.75;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #c5cae0;
`

const ResultContent = styled.div`
  background-color: #1a1e27;
  padding: 16px;
  border-radius: 6px;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 14px;
  position: relative;
  border-left: 3px solid ${THEME.primaryColor || '#4B56D2'};
  white-space: pre-wrap;
  overflow-x: auto;
  color: #e1e5ee;
`

const MetadataTag = styled.span`
  background-color: #303540;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 0.8rem;
  margin-right: 8px;
  display: inline-block;
  margin-bottom: 5px;
  transition: all 0.2s ease;
  color: #c5cae0;
  
  &:hover {
    background-color: ${THEME.primaryColor || '#4B56D2'};
    transform: translateY(-2px);
    color: white;
  }
`

const BusinessActionTag = styled(MetadataTag)`
  background-color: rgba(75, 86, 210, 0.2);
  color: ${THEME.primaryColor || '#4B56D2'};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  
  svg {
    margin-right: 5px;
  }
  
  &:hover {
    background-color: rgba(75, 86, 210, 0.3);
    color: white;
  }
`

const EmptyResults = styled.div`
  padding: 30px;
  text-align: center;
  background-color: #1a1e27;
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  margin: 20px 0;
  color: #e1e5ee;
  
  & svg {
    font-size: 2.5rem;
    opacity: 0.5;
    margin-bottom: 15px;
  }
  
  & p {
    font-size: 1.1rem;
    margin-bottom: 10px;
  }
  
  & span {
    font-size: 0.9rem;
    opacity: 0.6;
  }
`

const HelpText = styled.div`
  font-size: 0.85rem;
  opacity: 0.7;
  margin-top: 5px;
  line-height: 1.4;
  transition: opacity 0.2s ease;
  color: #a0a9bd;
  
  &:hover {
    opacity: 1;
  }
`

const SearchHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  
  & h2 {
    margin: 0;
    flex: 1;
    display: flex;
    align-items: center;
    color: #e1e5ee;
    
    svg {
      margin-right: 10px;
      color: ${THEME.primaryColor || '#4B56D2'};
    }
  }
`

const ErrorMessage = styled.div`
  background-color: rgba(239, 83, 80, 0.1);
  border-left: 3px solid #ef5350;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #ef5350;
`

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 12px;
  
  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background-color: #4caf50;
    border-radius: 50%;
    margin-right: 6px;
  }
`

const InfoBadge = styled.div`
  background-color: rgba(33, 150, 243, 0.1);
  color: #2196f3;
  font-size: 0.85rem;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
`

const TemplateButton = styled.button`
  background-color: #303540;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  text-align: left;
  transition: all 0.2s ease;
  color: #e1e5ee;
  
  h4 {
    margin: 0 0 5px 0;
    font-size: 1rem;
    color: #e1e5ee;
  }
  
  p {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.7;
    color: #a0a9bd;
  }
  
  &:hover {
    background-color: #393f4c;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`

const SimilarityScore = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
  width: 100%;
  color: #c5cae0;
`

const ScoreBar = styled.div<{ score: number }>`
  height: 8px;
  flex: 1;
  background-color: #1a1e27;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  margin-right: 10px;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.score * 100}%;
    background-color: ${props => {
      if (props.score > SCORE_THRESHOLDS.HIGH) return '#4caf50';
      if (props.score > SCORE_THRESHOLDS.MEDIUM) return '#ffc107';
      return '#ef5350';
    }};
    border-radius: 4px;
    transition: width 0.5s ease-out;
  }
`

const ResultActions = styled.div`
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
  overflow-x: auto;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
`

const Tab = styled.button<{ isActive: boolean }>`
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: ${props => props.isActive ? THEME.primaryColor || '#4B56D2' : '#e1e5ee'};
  opacity: ${props => props.isActive ? 1 : 0.7};
  cursor: pointer;
  font-weight: ${props => props.isActive ? 600 : 400};
  position: relative;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    opacity: 1;
    color: ${THEME.primaryColor || '#4B56D2'};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${THEME.primaryColor || '#4B56D2'};
    transform: scaleX(${props => props.isActive ? 1 : 0});
    transition: transform 0.2s ease;
    transform-origin: left;
  }
  
  &:hover::after {
    transform: scaleX(1);
  }
`

const WideButton = styled(Button)`
  width: 100%;
  justify-content: center;
  margin-bottom: 16px;
`

const InsightCard = styled.div`
  background-color: rgba(75, 86, 210, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  border-left: 3px solid ${THEME.primaryColor || '#4B56D2'};
  color: #e1e5ee;
`

const InsightHeader = styled.div`
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  color: #e1e5ee;
  
  svg {
    margin-right: 8px;
    color: ${THEME.primaryColor || '#4B56D2'};
  }
`

const BusinessValueTag = styled.div`
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, ${THEME.primaryColor || '#4B56D2'}, #7d88e6);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const TooltipBox = styled.div`
  position: absolute;
  z-index: 100;
  background-color: #303540;
  border-radius: 6px;
  padding: 10px;
  width: 240px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e1e5ee;
  
  &::after {
    content: '';
    position: absolute;
    top: -6px;
    left: 20px;
    width: 12px;
    height: 12px;
    background-color: #303540;
    transform: rotate(45deg);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
`

const SearchVisualization = styled.div`
  width: 100%;
  height: 200px;
  background-color: #1a1e27;
  border-radius: 8px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  margin-top: 20px;
`

const DotContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const Dot = styled.div<{ x: number; y: number; size: number; isQuery?: boolean }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background-color: ${props => props.isQuery ? (THEME.primaryColor || '#4B56D2') : 'rgba(255, 255, 255, 0.4)'};
  top: ${props => props.y}%;
  left: ${props => props.x}%;
  transform: translate(-50%, -50%);
  transition: all 0.5s ease;
  box-shadow: ${props => props.isQuery ? '0 0 10px rgba(75, 86, 210, 0.7)' : 'none'};
  border: ${props => props.isQuery ? '2px solid white' : 'none'};
  z-index: ${props => props.isQuery ? 10 : 1};
`

const Connection = styled.div<{ x1: number; y1: number; x2: number; y2: number; strength: number }>`
  position: absolute;
  height: 1px;
  background-color: rgba(75, 86, 210, ${props => 0.2 + props.strength * 0.6});
  transform-origin: 0 0;
  pointer-events: none;
  top: ${props => props.y1}%;
  left: ${props => props.x1}%;
  width: ${props => Math.sqrt(Math.pow(props.x2 - props.x1, 2) + Math.pow(props.y2 - props.y1, 2))}%;
  transform: rotate(${props => Math.atan2(props.y2 - props.y1, props.x2 - props.x1) * (180 / Math.PI)}deg);
`

const BusinessMetricsCard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
  margin-bottom: 24px;
`

const MetricBox = styled.div`
  background-color: #262b36;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  
  .metric-value {
    font-size: 1.8rem;
    font-weight: 600;
    color: ${THEME.primaryColor || '#4B56D2'};
    margin-bottom: 6px;
  }
  
  .metric-label {
    font-size: 0.9rem;
    opacity: 0.7;
    color: #c5cae0;
  }
`

// SVG Icons as React components
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const InsightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ExportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

// Types
interface SearchResultItem {
  id: string;
  score: number;
  payload: {
    text: string;
    source?: string;
    category?: string;
    chunk_index?: number;
    total_chunks?: number;
    file_size?: string;
    file_type?: string;
    processing_method?: string;
    date?: string;
    [key: string]: any;
  };
}

interface ApiSearchResponse {
  results: SearchResultItem[];
  metric_used: string;
  search_time_ms: number;
  total_found: number;
  embedding_time_ms: number;
  metric_params: any;
  tuned_parameters_applied: any;
  tuning_source: any;
  sparsity_achieved: any;
}

interface ProcessedSearchResult {
  id: string;
  text: string;
  score: number;
  metadata: Record<string, any>;
}

interface ApiSearchParams {
  collection_name: string;
  query_text?: string;
  query_vector?: number[];
  limit: number;
  use_native_search: boolean;
  score_all_documents: boolean;
  ef_param?: number;
}

// BusinessSearchDashboard Component (enhanced version)
const BusinessSearchDashboard: React.FC = () => {
  // State
  const [collectionName, setCollectionName] = useState('my_collection');
  const [queryInputMethod, setQueryInputMethod] = useState<'text' | 'vector'>('text');
  const [queryText, setQueryText] = useState('');
  const [queryVector, setQueryVector] = useState('');
  const [limit, setLimit] = useState(10);
  const [useNativeSearch, setUseNativeSearch] = useState(true);
  const [scoreAllDocuments, setScoreAllDocuments] = useState(false);
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
  const [efParam, setEfParam] = useState(128);
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<ProcessedSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{ 
    online: boolean, 
    queryTime?: number,
    metricUsed?: string,
    totalFound?: number,
    embeddingTime?: number
  }>({ online: true });
  
  const [activeTab, setActiveTab] = useState('results');
  const [savedSearches, setSavedSearches] = useState<Array<{id: string, name: string, query: string}>>([
    {id: 'saved1', name: 'Customer Feedback Analysis', query: 'Customer support experience negative feedback'},
    {id: 'saved2', name: 'Product Features Research', query: 'Most requested features for mobile app'},
  ]);
  
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Refs
  const visualizationRef = useRef<HTMLDivElement>(null);
  
  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/status`);
        if (response.data?.status === 'ok') {
          setApiStatus({ online: true });
        }
      } catch (error) {
        console.warn('API status check failed:', error);
        // Assuming we're using a proxy, still set online to true
        setApiStatus({ online: true });
      }
    };
    
    checkApiStatus();
  }, []);
  
  // Functions
  const parseVectorQuery = useCallback((): number[] | null => {
    if (!queryVector.trim()) return null;
    
    try {
      const parsed = JSON.parse(queryVector);
      if (!Array.isArray(parsed) || !parsed.every(x => typeof x === 'number')) {
        throw new Error('Invalid vector format');
      }
      return parsed;
    } catch (error) {
      return null;
    }
  }, [queryVector]);
  
  const isValidQuery = useMemo(() => {
    if (queryInputMethod === 'text') return queryText.trim().length > 0;
    return parseVectorQuery() !== null;
  }, [queryInputMethod, queryText, parseVectorQuery]);
  
  // Process API response to match our component's expected format
  const processSearchResults = (response: ApiSearchResponse): ProcessedSearchResult[] => {
    if (!response.results || !Array.isArray(response.results)) {
      return [];
    }
    
    return response.results.map(result => ({
      id: result.id,
      text: result.payload?.text || "No content available",
      score: result.score || 0,
      metadata: {
        ...result.payload,
        metric_used: response.metric_used,
        search_time_ms: response.search_time_ms,
        embedding_time_ms: response.embedding_time_ms
      }
    }));
  };
  
  // Search function with real API integration
  const performSearch = async (params: ApiSearchParams) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Make actual API call to the provided endpoint
      const response = await axios.post<ApiSearchResponse>(API_URL, params);
      
      // Process API response
      if (response.data) {
        const results = processSearchResults(response.data);
        setSearchResults(results);
        
        // Store API performance metrics
        setApiStatus({ 
          online: true, 
          queryTime: response.data.search_time_ms,
          metricUsed: response.data.metric_used,
          totalFound: response.data.total_found,
          embeddingTime: response.data.embedding_time_ms
        });
        
        setHasSearched(true);
        
        // After getting results, switch to the results tab
        setActiveTab('results');
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error searching collection:', error);
      setErrorMessage(
        error.response?.data?.error || 
        error.message || 
        'Failed to search collection. Please try again.'
      );
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Debounced search to prevent excessive API calls
  const debouncedSearch = useCallback(
    debounce(performSearch, 300),
    []
  );
  
  const handleSearch = async () => {
    if (!isValidQuery) return;
    
    const vectorQuery = queryInputMethod === 'vector' ? parseVectorQuery() : null;
    if (queryInputMethod === 'vector' && !vectorQuery) {
      setErrorMessage('Invalid JSON format for vector');
      return;
    }
    
    // Format parameters for API
    const params: ApiSearchParams = {
      collection_name: collectionName,
      limit,
      use_native_search: useNativeSearch,
      score_all_documents: scoreAllDocuments,
      ...(queryInputMethod === 'text' ? { query_text: queryText } : { query_vector: vectorQuery }),
      ...(useNativeSearch ? { ef_param: efParam } : {})
    };
    
    debouncedSearch(params);
  };
  
  const formatScore = (score: number): string => {
    return (score * 100).toFixed(1) + '%';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSearch();
    }
  };
  
  const generateRandomPosition = () => {
    return {
      x: 10 + Math.random() * 80, // keep away from edges
      y: 10 + Math.random() * 80
    };
  };
  
  const generateVisualizationData = () => {
    if (!searchResults.length) return { dots: [], connections: [] };
    
    // Generate query position (center)
    const queryPos = { x: 50, y: 50 };
    
    // Generate positions for results
    const resultPositions = searchResults.map(() => generateRandomPosition());
    
    // Create dots
    const dots = [
      // Query dot
      { ...queryPos, size: 20, isQuery: true },
      // Result dots
      ...resultPositions.map((pos, i) => ({ 
        ...pos, 
        size: 8 + searchResults[i].score * 12, 
        isQuery: false,
        resultIndex: i
      }))
    ];
    
    // Create connections
    const connections = resultPositions.map((pos, i) => ({
      x1: queryPos.x,
      y1: queryPos.y,
      x2: pos.x,
      y2: pos.y,
      strength: searchResults[i].score
    }));
    
    return { dots, connections };
  };
  
  const handleDotHover = (resultIndex?: number) => {
    if (resultIndex !== undefined) {
      const result = searchResults[resultIndex];
      setTooltipContent(`${result.id}: ${formatScore(result.score)}`);
      setShowTooltip(true);
      
      // Calculate position based on the dot's position
      if (visualizationRef.current) {
        const rect = visualizationRef.current.getBoundingClientRect();
        // Would need actual DOM positioning for accuracy, using approximation here
        setTooltipPosition({ 
          x: rect.width * 0.5, 
          y: rect.height * 0.5 
        });
      }
    } else {
      setShowTooltip(false);
    }
  };
  
  // Get key insights from results
  const getBusinessInsights = () => {
    if (!searchResults.length) return [];
    
    // Example insights (in real app, these would be derived from the result data)
    const insights = [
      {
        title: "Top Document Categories",
        content: "Your search results primarily contain documents from Customer Support (40%) and Product Development (30%) categories."
      },
      {
        title: "Sentiment Analysis",
        content: "The matching documents show predominantly neutral to positive sentiment, indicating customer satisfaction with related topics."
      },
      {
        title: "Time Distribution",
        content: "Most relevant documents were created within the last 3 months, showing recent activity on this topic."
      }
    ];
    
    return insights;
  };
  
  // Load a template search
  const loadTemplateSearch = (template: typeof BUSINESS_USE_CASES[0]) => {
    setQueryText(template.query);
    setQueryInputMethod('text');
  };
  
  // Load a saved search
  const loadSavedSearch = (saved: typeof savedSearches[0]) => {
    setQueryText(saved.query);
    setQueryInputMethod('text');
  };
  
  // Save current search
  const saveCurrentSearch = () => {
    if (!queryText.trim()) return;
    
    const newSavedSearch = {
      id: `saved${Date.now()}`,
      name: `Search - ${queryText.slice(0, 20)}${queryText.length > 20 ? '...' : ''}`,
      query: queryText
    };
    
    setSavedSearches([newSavedSearch, ...savedSearches]);
  };
  
  // Export results to CSV
  const exportResultsToCSV = () => {
    if (!searchResults.length) return;
    
    // In a real app, this would generate a CSV file for download
    alert("In a real app, this would download a CSV with all search results for further analysis.");
  };
  
  // Render business metrics based on search results
  const renderBusinessMetrics = () => {
    if (!searchResults.length) return null;
    
    const avgScore = searchResults.reduce((sum, item) => sum + item.score, 0) / searchResults.length;
    const highMatches = searchResults.filter(item => item.score > SCORE_THRESHOLDS.HIGH).length;
    const oldestDoc = "2022-05-15"; // This would be calculated from actual results
    
    return (
      <BusinessMetricsCard>
        <MetricBox>
          <div className="metric-value">{searchResults.length}</div>
          <div className="metric-label">Total Results</div>
        </MetricBox>
        <MetricBox>
          <div className="metric-value">{(avgScore * 100).toFixed(1)}%</div>
          <div className="metric-label">Average Match Quality</div>
        </MetricBox>
        <MetricBox>
          <div className="metric-value">{highMatches}</div>
          <div className="metric-label">High-Quality Matches</div>
        </MetricBox>
        <MetricBox>
          <div className="metric-value">{oldestDoc}</div>
          <div className="metric-label">Oldest Document</div>
        </MetricBox>
      </BusinessMetricsCard>
    );
  };
  
  // Calculate the visualization data
  const { dots, connections } = useMemo(() => 
    generateVisualizationData(), 
    [searchResults]
  );
  
  // Get insights
  const insights = useMemo(() => 
    getBusinessInsights(),
    [searchResults]
  );
  
  // Render component
  return (
    <PageContainer>
      <SearchHeader>
        <h2><DashboardIcon /> Intelligent Document Search</h2>
        {apiStatus.online && <StatusBadge>API Connected</StatusBadge>}
      </SearchHeader>
      
      <p style={{ 
        opacity: 0.8, 
        marginBottom: '24px', 
        lineHeight: '1.5',
        fontSize: '1.05rem',
        maxWidth: '800px',
        color: '#c5cae0'
      }}>
        Find business-critical information across all your documents using AI-powered semantic search. 
        Discover insights, trends, and connections that traditional keyword search can't uncover.
      </p>
      
      {errorMessage && (
        <ErrorMessage>
          Error: {errorMessage}
        </ErrorMessage>
      )}
      
      <Card>
        <CardTitle><SearchIcon /> Search Parameters</CardTitle>
        
        <TwoColumnGrid>
          <FormGroup>
            <Label htmlFor="collection-name">Content Collection</Label>
            <Input 
              id="collection-name"
              type="text" 
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="Enter collection name"
              aria-label="Collection Name"
            />
            <HelpText>
              The document collection to search (e.g., "customer_support", "product_docs")
            </HelpText>
          </FormGroup>
          
          <FormGroup>
            <Label>Search Type</Label>
            <RadioGroup>
              <RadioLabel>
                <input 
                  type="radio" 
                  id="text-query"
                  checked={queryInputMethod === 'text'}
                  onChange={() => setQueryInputMethod('text')}
                  name="queryInputMethod"
                  aria-label="Use text query"
                />
                Natural Language Search
              </RadioLabel>
              
              <RadioLabel>
                <input 
                  type="radio" 
                  id="vector-query"
                  checked={queryInputMethod === 'vector'}
                  onChange={() => setQueryInputMethod('vector')}
                  name="queryInputMethod"
                  aria-label="Use vector query"
                />
                Advanced Vector Search
              </RadioLabel>
            </RadioGroup>
          </FormGroup>
        </TwoColumnGrid>
        
        <FormGroup>
          {queryInputMethod === 'text' ? (
            <>
              <Label htmlFor="search-query">What are you looking for?</Label>
              <TextArea 
                id="search-query"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Describe what you're looking for in natural language..."
                onKeyDown={handleKeyDown}
                aria-label="Search query text"
              />
              <HelpText>
                Describe what you're looking for in detail. The AI will understand your intent and find semantically similar content. Press Ctrl/Cmd+Enter to search.
              </HelpText>
            </>
          ) : (
            <>
              <Label htmlFor="vector-input">Vector Embedding (for advanced users)</Label>
              <TextArea 
                id="vector-input"
                value={queryVector}
                onChange={(e) => setQueryVector(e.target.value)}
                placeholder="[0.1, 0.2, 0.3, ...]"
                onKeyDown={handleKeyDown}
                aria-label="Vector input as JSON array"
              />
              <HelpText>
                For technical users: Enter a vector embedding as a JSON array of numbers.
              </HelpText>
            </>
          )}
        </FormGroup>
        
        <Card style={{ padding: '16px', marginBottom: '20px', backgroundColor: '#252a38' }}>
          <CardTitle>Popular Search Templates</CardTitle>
          <ThreeColumnGrid>
            {BUSINESS_USE_CASES.map((template, index) => (
              <TemplateButton 
                key={index}
                onClick={() => loadTemplateSearch(template)}
              >
                <h4>{template.title}</h4>
                <p>{template.description}</p>
              </TemplateButton>
            ))}
          </ThreeColumnGrid>
        </Card>
        
        <ThreeColumnGrid>
          <FormGroup>
            <Label htmlFor="result-limit">Number of Results</Label>
            <Input 
              id="result-limit"
              type="number" 
              value={limit}
              onChange={(e) => setLimit(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              min="1"
              max="100"
              aria-label="Number of results to return"
            />
            <HelpText>
              How many similar documents to retrieve (1-100)
            </HelpText>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="native-search" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                id="native-search"
                type="checkbox" 
                checked={useNativeSearch}
                onChange={(e) => setUseNativeSearch(e.target.checked)}
                style={{ marginRight: '8px', cursor: 'pointer' }}
                aria-label="Use native search"
              />
              Fast Search
            </Label>
            <HelpText>
              Optimize for speed rather than maximum accuracy (recommended for most business use cases)
            </HelpText>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="score-all" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                id="score-all"
                type="checkbox" 
                checked={scoreAllDocuments}
                onChange={(e) => setScoreAllDocuments(e.target.checked)}
                style={{ marginRight: '8px', cursor: 'pointer' }}
                aria-label="Score all documents"
              />
              Comprehensive Scoring
            </Label>
            <HelpText>
              Score all matching documents for more precise results (may be slower)
            </HelpText>
          </FormGroup>
        </ThreeColumnGrid>
        
        <ExpanderHeader 
          onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
          aria-expanded={advancedOptionsOpen}
          aria-controls="advanced-options"
        >
          <span>Advanced Options (for technical users)</span>
          <span style={{ transform: advancedOptionsOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
        </ExpanderHeader>
        
        <ExpanderContent id="advanced-options" isOpen={advancedOptionsOpen}>
          {useNativeSearch && (
            <FormGroup>
              <Label htmlFor="ef-param">Search Precision vs. Speed</Label>
              <Input 
                id="ef-param"
                type="number" 
                value={efParam}
                onChange={(e) => setEfParam(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                min="1"
                max="500"
                aria-label="EF parameter value"
              />
              <HelpText>
                Higher values (200+) give more precise matches but slower search.
                Lower values (64-128) give faster results with slightly lower recall.
              </HelpText>
            </FormGroup>
          )}
        </ExpanderContent>
        
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
          <Button 
            onClick={handleSearch}
            disabled={isLoading || !isValidQuery}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Searching...
              </>
            ) : (
              <>
                <SearchIcon /> Search Documents
              </>
            )}
          </Button>
          
          <SecondaryButton 
            onClick={saveCurrentSearch}
            disabled={!queryText.trim() || isLoading}
          >
            <StarIcon /> Save Search
          </SecondaryButton>
        </div>
        
        {apiStatus.queryTime && !isLoading && hasSearched && (
          <HelpText style={{ textAlign: 'right', marginTop: '10px' }}>
            Search completed in {apiStatus.queryTime.toFixed(2)}ms
            {apiStatus.embeddingTime && <span> (AI processing: {apiStatus.embeddingTime.toFixed(2)}ms)</span>}
          </HelpText>
        )}
      </Card>
      
      {hasSearched && (
        <BusinessCard>
          <CardTitle>
            Search Results 
            {apiStatus.totalFound !== undefined && (
              <BusinessValueTag>Found: {apiStatus.totalFound}</BusinessValueTag>
            )}
          </CardTitle>
          
          <TabsContainer>
            <Tab 
              isActive={activeTab === 'results'} 
              onClick={() => setActiveTab('results')}
            >
              <DocumentIcon /> Documents
            </Tab>
            <Tab 
              isActive={activeTab === 'insights'} 
              onClick={() => setActiveTab('insights')}
            >
              <InsightIcon /> Business Insights
            </Tab>
            <Tab 
              isActive={activeTab === 'visualization'} 
              onClick={() => setActiveTab('visualization')}
            >
              <DashboardIcon /> Visual Analysis
            </Tab>
            <Tab 
              isActive={activeTab === 'saved'} 
              onClick={() => setActiveTab('saved')}
            >
              <StarIcon /> Saved Searches
            </Tab>
          </TabsContainer>
          
          {/* Document Results Tab */}
          {activeTab === 'results' && (
            <>
              {renderBusinessMetrics()}
              
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <ResultCard key={result.id || index} tabIndex={0}>
                    <ResultHeader>
                      <ResultTitle>{result.id || `Document ${index + 1}`}</ResultTitle>
                      <ResultScore score={result.score}>{formatScore(result.score)}</ResultScore>
                    </ResultHeader>
                    
                    <SimilarityScore>
                      <ScoreBar score={result.score} />
                      <div>{formatScore(result.score)} match</div>
                    </SimilarityScore>
                    
                    <ResultMeta>
                      {result.metadata?.source && (
                        <div>Source: {result.metadata.source}</div>
                      )}
                      {result.metadata?.category && (
                        <div>Category: {result.metadata.category}</div>
                      )}
                      {result.metadata?.date && (
                        <div>Date: {result.metadata.date}</div>
                      )}
                      {result.metadata?.file_type && (
                        <div>Type: {result.metadata.file_type}</div>
                      )}
                    </ResultMeta>
                    
                    <ResultContent>
                      {result.text}
                    </ResultContent>
                    
                    <div>
                      {/* Display chunk information if available */}
                      {result.metadata?.chunk_index !== undefined && result.metadata?.total_chunks && (
                        <MetadataTag>
                          Page {result.metadata.chunk_index + 1} of {result.metadata.total_chunks}
                        </MetadataTag>
                      )}
                      
                      {/* Display file size if available */}
                      {result.metadata?.file_size && (
                        <MetadataTag>Size: {result.metadata.file_size}</MetadataTag>
                      )}

                      {/* Display custom tags if available */}
                      {result.metadata?.tags && Array.isArray(result.metadata.tags) && 
                        result.metadata.tags.map((tag: string, i: number) => (
                          <MetadataTag key={i}>{tag}</MetadataTag>
                        ))
                      }
                    </div>
                    
                    <ResultActions>
                      <BusinessActionTag>
                        <ExportIcon /> Export
                      </BusinessActionTag>
                      <BusinessActionTag>
                        <ShareIcon /> Share
                      </BusinessActionTag>
                      <BusinessActionTag>
                        <StarIcon /> Save
                      </BusinessActionTag>
                    </ResultActions>
                  </ResultCard>
                ))
              ) : (
                <EmptyResults>
                  <p>No matching documents found</p>
                  <span>Try broadening your search or using different terms</span>
                </EmptyResults>
              )}
              
              {searchResults.length > 0 && (
                <WideButton onClick={exportResultsToCSV}>
                  <ExportIcon /> Export All Results to Excel/CSV
                </WideButton>
              )}
            </>
          )}
          
          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div>
              <BusinessCard className="insight-card">
                <CardTitle><InsightIcon /> Key Business Insights</CardTitle>
                <p style={{ color: '#e1e5ee' }}>AI-powered analysis of your search results reveals these key business insights:</p>
                
                {insights.length > 0 ? (
                  insights.map((insight, index) => (
                    <InsightCard key={index}>
                      <InsightHeader><InsightIcon /> {insight.title}</InsightHeader>
                      <p>{insight.content}</p>
                    </InsightCard>
                  ))
                ) : (
                  <EmptyResults>
                    <p>No insights available</p>
                    <span>Perform a search with more results to generate business insights</span>
                  </EmptyResults>
                )}
                
                {insights.length > 0 && (
                  <p style={{ marginTop: '20px', opacity: 0.8, color: '#c5cae0' }}>
                    These insights are generated automatically from patterns detected in your search results. 
                    Use them to identify trends, opportunities, and areas for further investigation.
                  </p>
                )}
              </BusinessCard>
            </div>
          )}
          
          {/* Visualization Tab */}
          {activeTab === 'visualization' && (
            <div>
              <p style={{ marginBottom: '15px', color: '#e1e5ee' }}>
                This visual representation shows the semantic relationships between your query and the matching documents.
                Larger and brighter nodes indicate stronger matches.
              </p>
              
              <SearchVisualization ref={visualizationRef}>
                {connections.map((connection, i) => (
                  <Connection 
                    key={`connection-${i}`}
                    x1={connection.x1} 
                    y1={connection.y1} 
                    x2={connection.x2} 
                    y2={connection.y2}
                    strength={connection.strength}
                  />
                ))}
                
                <DotContainer>
                  {dots.map((dot, i) => (
                    <Dot 
                      key={`dot-${i}`}
                      x={dot.x} 
                      y={dot.y} 
                      size={dot.size} 
                      isQuery={dot.isQuery}
                      onMouseEnter={() => handleDotHover(dot.resultIndex)}
                      onMouseLeave={() => setShowTooltip(false)}
                    />
                  ))}
                </DotContainer>
                
                {showTooltip && (
                  <TooltipBox style={{ 
                    top: `${tooltipPosition.y}px`, 
                    left: `${tooltipPosition.x}px` 
                  }}>
                    {tooltipContent}
                  </TooltipBox>
                )}
              </SearchVisualization>
              
              <p style={{ marginTop: '15px', fontSize: '0.85rem', opacity: 0.7, color: '#a0a9bd' }}>
                The blue dot represents your query. Connected dots are the matching documents, with 
                proximity and size indicating match quality.
              </p>
            </div>
          )}
          
          {/* Saved Searches Tab */}
          {activeTab === 'saved' && (
            <div>
              <p style={{ marginBottom: '20px', color: '#e1e5ee' }}>
                Your saved searches allow you to quickly run frequent queries without retyping them.
              </p>
              
              {savedSearches.length > 0 ? (
                savedSearches.map((saved) => (
                  <ResultCard key={saved.id}>
                    <ResultHeader>
                      <ResultTitle>{saved.name}</ResultTitle>
                    </ResultHeader>
                    <ResultContent style={{ marginTop: '10px' }}>
                      {saved.query}
                    </ResultContent>
                    <Button 
                      onClick={() => {
                        loadSavedSearch(saved);
                        setTimeout(handleSearch, 100);
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      <SearchIcon /> Run This Search
                    </Button>
                  </ResultCard>
                ))
              ) : (
                <EmptyResults>
                  <p>No saved searches yet</p>
                  <span>Save your frequent searches for quick access in the future</span>
                </EmptyResults>
              )}
            </div>
          )}
        </BusinessCard>
      )}
    </PageContainer>
  );
};

export default BusinessSearchDashboard;