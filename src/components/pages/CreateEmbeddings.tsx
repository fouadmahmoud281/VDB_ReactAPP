import { useState, useEffect, useRef, useMemo } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import { THEME } from '../../theme';
import { config } from '../../config';
import { AnimatePresence, motion } from 'framer-motion';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PageTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.8rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const PageDescription = styled.p`
  opacity: 0.8;
  margin-bottom: 25px;
  line-height: 1.5;
  max-width: 900px;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 20px;
  }
`;

const Card = styled(motion.div)`
  background-color: ${THEME.secondaryBgColor};
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.12);
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 20px;
  }
`;

const CardTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 14px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 180px;
  background-color: #1e232d;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 14px;
  color: ${THEME.textColor};
  font-family: inherit;
  resize: vertical;
  font-size: 0.95rem;
  line-height: 1.5;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${THEME.primaryColor};
    box-shadow: 0 0 0 3px rgba(75, 86, 210, 0.25);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  @media (max-width: 768px) {
    min-height: 150px;
    padding: 12px;
  }
`;

const TextInput = styled.input`
  width: 100%;
  background-color: #1e232d;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 14px;
  color: ${THEME.textColor};
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${THEME.primaryColor};
    box-shadow: 0 0 0 3px rgba(75, 86, 210, 0.25);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Button = styled.button`
  background-color: ${THEME.primaryColor};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.2, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.1);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.5s cubic-bezier(0.3, 0, 0.3, 1);
    pointer-events: none;
  }
  
  &:hover {
    background-color: #5A66E3;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:hover::before {
    transform: scaleX(1);
    transform-origin: left;
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    background-color: #3A3F4C;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
  }
`;

const ButtonIcon = styled.span`
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RadioGroupContainer = styled.div`
  background-color: #1e232d;
  border-radius: 8px;
  padding: 5px;
  display: inline-flex;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const RadioOption = styled.label<{ selected: boolean }>`
  padding: 10px 18px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  background-color: ${props => props.selected ? THEME.primaryColor : 'transparent'};
  color: ${props => props.selected ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  
  &:hover {
    color: white;
    background-color: ${props => props.selected ? THEME.primaryColor : 'rgba(255, 255, 255, 0.1)'};
  }
  
  input {
    position: absolute;
    opacity: 0;
    height: 0;
    width: 0;
  }
  
  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 0.9rem;
  }
`;

const EmbeddingVisualizer = styled.div`
  background-color: #15181f;
  border-radius: 10px;
  padding: 20px;
  margin-top: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const HeatmapGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12px, 1fr));
  gap: 2px;
  margin-top: 10px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(8px, 1fr));
    gap: 1px;
  }
`;

const HeatmapCell = styled.div<{ value: number }>`
  aspect-ratio: 1;
  background-color: ${props => {
    // Generate a color based on the value (between -1 and 1)
    const normalizedValue = (props.value + 1) / 2; // Convert to 0-1 range
    return `hsl(${240 + normalizedValue * 60}, ${80 + normalizedValue * 20}%, ${normalizedValue * 60 + 20}%)`;
  }};
  border-radius: 2px;
  transition: transform 0.15s ease;
  
  &:hover {
    transform: scale(1.5);
    z-index: 1;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'outline' }>`
  background-color: ${props => 
    props.variant === 'primary' ? THEME.primaryColor : 
    props.variant === 'outline' ? 'transparent' : '#262b36'
  };
  color: ${props => 
    props.variant === 'outline' ? 'rgba(255, 255, 255, 0.8)' : 'white'
  };
  border: 1px solid ${props => 
    props.variant === 'outline' ? 'rgba(255, 255, 255, 0.2)' : 
    props.variant === 'primary' ? THEME.primaryColor : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background-color: ${props => 
      props.variant === 'primary' ? '#5A66E3' : 
      props.variant === 'outline' ? 'rgba(255, 255, 255, 0.1)' : '#303540'
    };
    border-color: ${props => 
      props.variant === 'outline' ? 'rgba(255, 255, 255, 0.3)' : 
      props.variant === 'primary' ? '#5A66E3' : 'rgba(255, 255, 255, 0.2)'
    };
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }
`;

const StatCard = styled(Card)`
  padding: 20px;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-3px);
  }
`;

const StatLabel = styled.div`
  opacity: 0.7;
  font-size: 0.9rem;
  margin-bottom: 8px;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 3px;
  background: linear-gradient(90deg, #fff, #a3abff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StatSubtext = styled.div`
  font-size: 0.85rem;
  opacity: 0.7;
  margin-top: 5px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SectionTitle = styled.h3`
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 1.4rem;
  font-weight: 600;
  position: relative;
  padding-left: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: ${THEME.primaryColor};
    border-radius: 4px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 15px;
  }
`;

const EmbeddingText = styled.div`
  background: #15181f;
  padding: 15px;
  border-radius: 8px;
  margin-top: 8px;
  margin-bottom: 18px;
  font-size: 0.95rem;
  line-height: 1.5;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.08);
  max-height: 100px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
`;

const EmbeddingDimension = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
`;

const EmbeddingMetric = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const MetricLabel = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
`;

const MetricValue = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 3px solid #f44336;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #f44336;
`;

const SuccessMessage = styled(motion.div)`
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 3px solid #4CAF50;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #4CAF50;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button<{ active: boolean }>`
  background: transparent;
  border: none;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? THEME.primaryColor : 'rgba(255, 255, 255, 0.7)'};
  border-bottom: 2px solid ${props => props.active ? THEME.primaryColor : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.active ? THEME.primaryColor : 'white'};
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const FileUploadArea = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 20px;
  
  &:hover {
    border-color: ${THEME.primaryColor};
    background-color: rgba(68, 102, 255, 0.05);
  }
`;

const FileUploadText = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
`;

const FileUploadSubtext = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
`;

const UploadedFileInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 10px 15px;
  margin-top: 15px;
  
  svg {
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const ComparisonContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ComparisonCard = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EmbeddingControls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const SimilarityScore = styled.div`
  background: linear-gradient(135deg, #4466ff, #a155fd);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const SimilarityValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
`;

const SimilarityLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const SectionTitleControls = styled.div`
  display: flex;
  gap: 10px;
`;

const Badge = styled.span<{ type?: 'success' | 'warning' | 'info' }>`
  background-color: ${props => 
    props.type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 
    props.type === 'warning' ? 'rgba(255, 152, 0, 0.2)' : 
    'rgba(68, 102, 255, 0.2)'
  };
  color: ${props => 
    props.type === 'success' ? '#4CAF50' : 
    props.type === 'warning' ? '#FF9800' : 
    '#4466ff'
  };
  font-size: 0.8rem;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
  margin-left: 10px;
`;

const ChartContainer = styled.div`
  height: 200px;
  margin-top: 20px;
  position: relative;
`;

const ChartBar = styled.div<{ height: number }>`
  position: absolute;
  bottom: 0;
  height: ${props => props.height}%;
  background: linear-gradient(to top, #4466ff, #a155fd);
  border-radius: 4px 4px 0 0;
  width: 30px;
  transition: height 0.5s cubic-bezier(0.2, 0, 0.2, 1);
`;

const SearchForm = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  pointer-events: none;
  white-space: nowrap;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
  }
`;

// New business-oriented components
const BusinessValueCard = styled(Card)`
  background: linear-gradient(135deg, #1e232d, #262b36);
  border-left: 4px solid ${THEME.primaryColor};
`;

const UseCaseTag = styled.span`
  background-color: rgba(68, 102, 255, 0.15);
  color: ${THEME.primaryColor};
  font-size: 0.85rem;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 500;
  margin-right: 8px;
  margin-bottom: 8px;
  display: inline-block;
`;

const UseCasesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  margin-bottom: 15px;
`;

const InfoBox = styled.div`
  background-color: rgba(33, 150, 243, 0.1);
  border-left: 3px solid #2196F3;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 6px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
`;

const TemplateSelector = styled.select`
  width: 100%;
  padding: 12px 14px;
  background-color: #1e232d;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: ${THEME.textColor};
  font-size: 0.95rem;
  margin-bottom: 20px;
  
  &:focus {
    outline: none;
    border-color: ${THEME.primaryColor};
    box-shadow: 0 0 0 3px rgba(75, 86, 210, 0.25);
  }
  
  option {
    background-color: #1e232d;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 20px 0 30px;
  
  &::before {
    content: '';
    position: absolute;
    top: 14px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: rgba(255, 255, 255, 0.1);
    z-index: 0;
  }
`;

const Step = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  
  .step-circle {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: ${props => 
      props.completed ? THEME.primaryColor : 
      props.active ? 'rgba(68, 102, 255, 0.2)' : 
      'rgba(255, 255, 255, 0.1)'
    };
    color: ${props => 
      props.completed ? 'white' : 
      props.active ? THEME.primaryColor : 
      'rgba(255, 255, 255, 0.5)'
    };
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  
  .step-label {
    font-size: 0.85rem;
    color: ${props => props.active || props.completed ? 'white' : 'rgba(255, 255, 255, 0.5)'};
    font-weight: ${props => props.active || props.completed ? '500' : '400'};
  }
`;

const ROITable = styled.div`
  margin: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const ROITableRow = styled.div<{ isHeader?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: ${props => props.isHeader ? 'rgba(255, 255, 255, 0.05)' : 'transparent'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ROICell = styled.div<{ highlight?: boolean }>`
  font-size: 0.95rem;
  color: ${props => props.highlight ? '#4CAF50' : 'inherit'};
  font-weight: ${props => props.highlight ? '600' : 'inherit'};
`;

const QuickStartButton = styled(Button)`
  background: linear-gradient(135deg, #4466ff, #a155fd);
  
  &:hover {
    background: linear-gradient(135deg, #3b5bf0, #9a4af0);
  }
`;

const TipsAccordion = styled.div`
  margin-top: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const TipsHeader = styled.div`
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  
  svg {
    transition: transform 0.3s ease;
  }
`;

const TipsContent = styled.div<{ isOpen: boolean }>`
  padding: ${props => props.isOpen ? '15px' : '0 15px'};
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${props => props.isOpen ? '1' : '0'};
`;

const SampleLibrary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const SampleCard = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-3px);
  }
`;

const SampleTitle = styled.div`
  font-weight: 500;
  margin-bottom: 8px;
`;

const SampleDescription = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
`;

const IntegrationBadge = styled.div<{ platform: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: white;
  background-color: ${props => {
    switch (props.platform) {
      case 'salesforce': return '#00A1E0';
      case 'hubspot': return '#FF7A59';
      case 'shopify': return '#7AB55C';
      case 'zendesk': return '#03363D';
      default: return '#444';
    }
  }};
  padding: 3px 8px;
  border-radius: 4px;
  margin-right: 8px;
  margin-bottom: 8px;
`;

interface EmbeddingItem {
  text: string;
  embedding: number[];
  created: Date;
  dimensions: number;
  norm: number;
}

interface ApiEmbeddingResponse {
  embeddings: number[][];
  model_used: string;
  dimensions: number;
  processing_time_ms: number;
}

// Sample template options for different business use cases
const businessTemplates = [
  { 
    id: 'customer_support', 
    name: 'Customer Support Queries', 
    description: 'Identify similar customer support tickets to find common solutions',
    sampleText: 'Im unable to log into my account. Ive tried resetting my password but I m not receiving the reset email.'
  },
  { 
    id: 'product_descriptions', 
    name: 'Product Descriptions', 
    description: 'Create consistent product embeddings for semantic product search',
    sampleText: 'Wireless noise-cancelling headphones with 30-hour battery life, premium sound quality, and comfortable over-ear design.'
  },
  { 
    id: 'legal_contracts', 
    name: 'Legal Document Clauses', 
    description: 'Find similar clauses across different legal documents',
    sampleText: 'The parties agree to maintain the confidentiality of all proprietary information shared during the course of this agreement.'
  },
  { 
    id: 'customer_reviews', 
    name: 'Customer Reviews Analysis', 
    description: 'Analyze sentiment and key themes in customer feedback',
    sampleText: 'The product worked great for the first month, but then started to slow down. Customer service was helpful in resolving the issue.'
  },
  { 
    id: 'market_research', 
    name: 'Market Research', 
    description: 'Analyze trends and patterns across market research data',
    sampleText: 'Our survey indicates that 65% of consumers prefer eco-friendly packaging and are willing to pay a premium of up to 12% for sustainably sourced products.'
  }
];

// Enhanced component with business-friendly features
const CreateEmbeddings: React.FC = () => {
  // State management
  const [inputMethod, setInputMethod] = useState<'single' | 'multiple'>('single');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [embeddingsHistory, setEmbeddingsHistory] = useState<EmbeddingItem[]>([]);
  const [totalEmbeddings, setTotalEmbeddings] = useState(0);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'compare' | 'integrations'>('text');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [compareItem1, setCompareItem1] = useState<EmbeddingItem | null>(null);
  const [compareItem2, setCompareItem2] = useState<EmbeddingItem | null>(null);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmbeddings, setFilteredEmbeddings] = useState<EmbeddingItem[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [searchInProgress, setSearchInProgress] = useState(false);
  const [modelType, setModelType] = useState('sentence-transformer-384');
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showTips, setShowTips] = useState(false);
  const [showROI, setShowROI] = useState(false);
  const [showBusinessValue, setShowBusinessValue] = useState(true);
  const [integrationsExpanded, setIntegrationsExpanded] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // API Configuration from centralized config
  const API_URL = '/api/embed'; // This will be proxied to the configured API base URL
  
  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedTotal = localStorage.getItem('totalEmbeddings');
    if (savedTotal) {
      setTotalEmbeddings(parseInt(savedTotal));
    }
    
    const savedHistory = localStorage.getItem('embeddingsHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert string dates back to Date objects
        const processedHistory = parsedHistory.map((item: any) => ({
          ...item,
          created: new Date(item.created)
        }));
        setEmbeddingsHistory(processedHistory);
      } catch (e) {
        console.error('Error parsing saved embeddings history:', e);
      }
    }
  }, []);
  
  // Handle template selection
  useEffect(() => {
    if (selectedTemplate) {
      const template = businessTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        setInputText(template.sampleText);
      }
    }
  }, [selectedTemplate]);
  
  // Calculate vector norm (magnitude)
  const calculateNorm = (vector: number[]): number => {
    return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  };
  
  // Calculate cosine similarity between two embeddings
  const calculateCosineSimilarity = (embedding1: number[], embedding2: number[]): number => {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }
    
    return dotProduct / (magnitude1 * magnitude2);
  };
  
  // Reset error and success messages
  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };
  
  // Show success message with auto-dismiss
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };
  
  // Advance to next step in the workflow
  const advanceStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleCreateEmbedding = async () => {
    let textToProcess = '';
    
    if (activeTab === 'text') {
      if (!inputText.trim()) return;
      textToProcess = inputText;
    } else if (activeTab === 'file') {
      if (!fileContent.trim()) return;
      textToProcess = fileContent;
    } else {
      return;
    }
    
    resetMessages();
    setIsLoading(true);
    const startTime = performance.now();
    
    try {
      const textsToEmbed = inputMethod === 'single' 
        ? [textToProcess.trim()] 
        : textToProcess.split('\n').filter(text => text.trim());
      
      // Make the actual API call to the embedding service
      const response = await axios.post(API_URL, textsToEmbed);
      
      // Process the real API response
      if (response.data && response.data.embeddings) {
        const apiResponse = response.data as ApiEmbeddingResponse;
        
        const endTime = performance.now();
        setProcessingTime(endTime - startTime);
        
        // Create embedding items from API response
        const newEmbeddings = textsToEmbed.map((text, index) => {
          const embedding = apiResponse.embeddings[index];
          return {
            text,
            embedding,
            created: new Date(),
            dimensions: embedding.length,
            norm: calculateNorm(embedding)
          };
        });
        
        // Add to history
        const updatedHistory = [...newEmbeddings, ...embeddingsHistory].slice(0, 20);
        setEmbeddingsHistory(updatedHistory);
        
        // Update total and save to localStorage
        const newTotal = totalEmbeddings + newEmbeddings.length;
        setTotalEmbeddings(newTotal);
        localStorage.setItem('totalEmbeddings', newTotal.toString());
        localStorage.setItem('embeddingsHistory', JSON.stringify(updatedHistory));
        
        // Clear input for single text mode
        if (activeTab === 'text' && inputMethod === 'single') {
          setInputText('');
        }
        
        // Show success message
        const embedCount = newEmbeddings.length;
        showSuccessMessage(`Successfully created ${embedCount} ${embedCount === 1 ? 'embedding' : 'embeddings'}`);
        
        // If file was used, clear it
        if (activeTab === 'file') {
          setUploadedFile(null);
          setFileContent('');
        }
        
        // Update filtered embeddings if there's a search query
        if (searchQuery) {
          handleSearchEmbeddings();
        }
        
        // Advance to the next step
        advanceStep();
        
      } else {
        throw new Error('Invalid response format from embedding API');
      }
    } catch (error) {
      console.error('Error creating embeddings:', error);
      setErrorMessage(
        error.response?.data?.error || 
        error.message || 
        'Failed to create embeddings. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyEmbedding = (embedding: number[]) => {
    navigator.clipboard.writeText(JSON.stringify(embedding))
      .then(() => {
        showSuccessMessage('Embedding copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy embedding:', err);
        setErrorMessage('Failed to copy to clipboard');
      });
  };
  
  const handleDownloadEmbedding = (item: EmbeddingItem, index: number) => {
    const dataStr = JSON.stringify({
      text: item.text,
      embedding: item.embedding,
      created: item.created,
      dimensions: item.dimensions,
      norm: item.norm
    }, null, 2);
    
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const filename = `embedding_${item.text.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${index + 1}.json`;
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataUri);
    downloadAnchorNode.setAttribute('download', filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    showSuccessMessage('Embedding downloaded successfully');
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFileContent(event.target.result.toString());
      }
    };
    reader.readAsText(file);
  };
  
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const clearUploadedFile = () => {
    setUploadedFile(null);
    setFileContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleCompare = () => {
    if (!compareItem1 || !compareItem2) return;
    
    try {
      const similarity = calculateCosineSimilarity(
        compareItem1.embedding,
        compareItem2.embedding
      );
      
      setSimilarityScore(similarity);
      setShowChart(true);
      showSuccessMessage('Similarity calculation complete');
      
      // Advance to the next step in the workflow
      advanceStep();
      
    } catch (error) {
      console.error('Error calculating similarity:', error);
      setErrorMessage('Error calculating similarity - ensure both embeddings have the same dimensions');
    }
  };
  
  const handleSearchEmbeddings = () => {
    if (!searchQuery.trim()) {
      setFilteredEmbeddings([]);
      return;
    }
    
    setSearchInProgress(true);
    
    // Simple text search for now, in real app this would use embeddings-based search
    const results = embeddingsHistory.filter(item => 
      item.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredEmbeddings(results);
    setSearchInProgress(false);
    
    // Advance to the next step if results are found
    if (results.length > 0) {
      advanceStep();
    }
  };
  
  const handleDeleteEmbedding = (index: number) => {
    const updatedHistory = [...embeddingsHistory];
    updatedHistory.splice(index, 1);
    setEmbeddingsHistory(updatedHistory);
    localStorage.setItem('embeddingsHistory', JSON.stringify(updatedHistory));
    showSuccessMessage('Embedding deleted');
    
    // Update filtered results if needed
    if (searchQuery) {
      setFilteredEmbeddings(prevFiltered => {
        const newFiltered = [...prevFiltered];
        const filteredIndex = newFiltered.findIndex(item => 
          item === embeddingsHistory[index]
        );
        if (filteredIndex !== -1) {
          newFiltered.splice(filteredIndex, 1);
        }
        return newFiltered;
      });
    }
  };
  
  const handleExportAllEmbeddings = () => {
    if (embeddingsHistory.length === 0) {
      setErrorMessage('No embeddings to export');
      return;
    }
    
    const dataStr = JSON.stringify({
      embeddings: embeddingsHistory,
      total_count: embeddingsHistory.length,
      export_date: new Date().toISOString(),
      model: modelType
    }, null, 2);
    
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFilename = `vector_embeddings_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataUri);
    downloadAnchorNode.setAttribute('download', exportFilename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    showSuccessMessage(`Exported ${embeddingsHistory.length} embeddings successfully`);
  };
  
  const showEmbeddingDimensionTooltip = (dimension: number, value: number) => {
    setTooltipText(`Dimension ${dimension + 1}: ${value.toFixed(4)}`);
    setTooltipVisible(true);
  };
  
  const hideTooltip = () => {
    setTooltipVisible(false);
  };
  
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // For the comparative chart - dimensions to show
  const dimensionsToShow = useMemo(() => {
    if (!compareItem1 || !compareItem2) return [];
    
    // Get 10 random dimensions for comparison
    const dimensions = [];
    const maxDim = Math.min(compareItem1.embedding.length, compareItem2.embedding.length);
    for (let i = 0; i < 10; i++) {
      dimensions.push(Math.floor(Math.random() * maxDim));
    }
    return dimensions.sort((a, b) => a - b);
  }, [compareItem1, compareItem2]);
  
  // Calculate the estimated monthly time savings based on total embeddings
  const calculateTimeSavings = () => {
    // Assume each manual search without embeddings takes 5 minutes vs 5 seconds with embeddings
    const timePerManualSearch = 5; // minutes
    const timePerEmbeddingSearch = 5/60; // 5 seconds in minutes
    
    // Assume each embedding is used 10 times per month
    const searchesPerMonth = totalEmbeddings * 10;
    
    // Calculate time saved
    const timeSavedMinutes = searchesPerMonth * (timePerManualSearch - timePerEmbeddingSearch);
    const timeSavedHours = Math.round(timeSavedMinutes / 60);
    
    return timeSavedHours;
  };
  
  // Apply a sample text from the library
  const applySampleText = (sampleIndex: number) => {
    setInputText(businessTemplates[sampleIndex].sampleText);
    setSelectedTemplate(businessTemplates[sampleIndex].id);
  };
  
  // Display embeddings list based on search or full history
  const displayEmbeddings = searchQuery.trim() ? filteredEmbeddings : embeddingsHistory;
  
  // Calculate estimated ROI
  const timeSavedHours = calculateTimeSavings();
  const averageHourlyRate = 25; // Assume $25/hour average employee cost
  const monthlySavings = timeSavedHours * averageHourlyRate;
  const yearlyROI = monthlySavings * 12;
  
  return (
    <PageContainer>
      <PageTitle>AI Vector Embeddings Platform</PageTitle>
      <PageDescription>
        Transform your business text data into powerful AI-ready vector embeddings to enhance search, recommendations, 
        and text analysis capabilities across your organization. No machine learning expertise required.
      </PageDescription>
      
      {showBusinessValue && (
        <BusinessValueCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CardTitle>
            Business Value
            <ActionButton variant="outline" onClick={() => setShowBusinessValue(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </ActionButton>
          </CardTitle>
          
          <div>Vector embeddings enable AI-powered capabilities that drive measurable business outcomes:</div>
          
          <UseCasesContainer>
            <UseCaseTag>Intelligent Search</UseCaseTag>
            <UseCaseTag>Content Recommendations</UseCaseTag>
            <UseCaseTag>Customer Support Automation</UseCaseTag>
            <UseCaseTag>Sentiment Analysis</UseCaseTag>
            <UseCaseTag>Knowledge Management</UseCaseTag>
            <UseCaseTag>Document Classification</UseCaseTag>
          </UseCasesContainer>
          
          <ButtonGroup>
            <QuickStartButton onClick={() => setShowROI(!showROI)}>
              <ButtonIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </ButtonIcon>
              {showROI ? 'Hide ROI Calculator' : 'Show ROI Calculator'}
            </QuickStartButton>
            
            <ActionButton 
              variant="outline"
              onClick={() => {
                setActiveTab('text');
                setSelectedTemplate('customer_support');
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l-4 4L9 9.51l-3 3L8 15l3-3 4.49-.99 4-4L13 3z" />
                <path d="M18 14l-3 3 1 3 3-3 1-3-2-2z" />
              </svg>
              Start with Sample Data
            </ActionButton>
          </ButtonGroup>
          
          {showROI && (
            <ROITable>
              <ROITableRow isHeader>
                <ROICell>Business Impact Metrics</ROICell>
                <ROICell>Estimated Value</ROICell>
              </ROITableRow>
              <ROITableRow>
                <ROICell>Time Saved (monthly)</ROICell>
                <ROICell highlight>{timeSavedHours} hours</ROICell>
              </ROITableRow>
              <ROITableRow>
                <ROICell>Monthly Cost Savings</ROICell>
                <ROICell highlight>${monthlySavings.toLocaleString()}</ROICell>
              </ROITableRow>
              <ROITableRow>
                <ROICell>Annual ROI</ROICell>
                <ROICell highlight>${yearlyROI.toLocaleString()}</ROICell>
              </ROITableRow>
              <ROITableRow>
                <ROICell>Enhanced Employee Productivity</ROICell>
                <ROICell>+{Math.round(timeSavedHours/160 * 100)}%</ROICell>
              </ROITableRow>
            </ROITable>
          )}
        </BusinessValueCard>
      )}
      
      <AnimatePresence>
        {errorMessage && (
          <ErrorMessage>
            Error: {errorMessage}
          </ErrorMessage>
        )}
        
        {successMessage && (
          <SuccessMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {successMessage}
          </SuccessMessage>
        )}
      </AnimatePresence>
      
      <StepIndicator>
        <Step active={currentStep === 1} completed={currentStep > 1}>
          <div className="step-circle">
            {currentStep > 1 ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : 1}
          </div>
          <div className="step-label">Create Embeddings</div>
        </Step>
        
        <Step active={currentStep === 2} completed={currentStep > 2}>
          <div className="step-circle">
            {currentStep > 2 ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : 2}
          </div>
          <div className="step-label">Analyze & Compare</div>
        </Step>
        
        <Step active={currentStep === 3} completed={false}>
          <div className="step-circle">3</div>
          <div className="step-label">Apply & Integrate</div>
        </Step>
      </StepIndicator>
      
      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatLabel>Total Embeddings</StatLabel>
          <StatValue>{totalEmbeddings.toLocaleString()}</StatValue>
          <StatSubtext>Across all sessions</StatSubtext>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatLabel>AI Model</StatLabel>
          <StatValue>all-MiniLM-L6-v2          </StatValue>
          <StatSubtext>Sentence Transformer (384-dim)</StatSubtext>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatLabel>Processing Capacity</StatLabel>
          <StatValue>~{processingTime ? Math.round(500 * (1000 / processingTime)) : 500}/minute</StatValue>
          <StatSubtext>Enterprise scale ready</StatSubtext>
        </StatCard>
      </StatsGrid>
      
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <CardTitle>Create AI-Powered Vector Embeddings</CardTitle>
        
        <TabContainer>
          <Tab 
            active={activeTab === 'text'} 
            onClick={() => setActiveTab('text')}
          >
            Text Input
          </Tab>
          <Tab 
            active={activeTab === 'file'} 
            onClick={() => setActiveTab('file')}
          >
            Bulk Upload
          </Tab>
          <Tab 
            active={activeTab === 'compare'} 
            onClick={() => setActiveTab('compare')}
          >
            Content Similarity
          </Tab>
          <Tab 
            active={activeTab === 'integrations'} 
            onClick={() => setActiveTab('integrations')}
          >
            Integrations
          </Tab>
        </TabContainer>
        
        {activeTab === 'text' && (
          <>
            <InfoBox>
              Vector embeddings convert text into AI-ready numerical representations, enabling machines to understand semantic meaning and similarity between content.
            </InfoBox>
            
            <FormGroup>
              <Label>Select a Business Use Case Template (Optional)</Label>
              <TemplateSelector
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                <option value="">Select a template...</option>
                {businessTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </TemplateSelector>
            </FormGroup>
            
            <RadioGroupContainer>
              <RadioOption selected={inputMethod === 'single'}>
                <input 
                  type="radio" 
                  checked={inputMethod === 'single'}
                  onChange={() => setInputMethod('single')}
                  name="inputMethod"
                />
                Single content item
              </RadioOption>
              
              <RadioOption selected={inputMethod === 'multiple'}>
                <input 
                  type="radio" 
                  checked={inputMethod === 'multiple'}
                  onChange={() => setInputMethod('multiple')}
                  name="inputMethod"
                />
                Batch processing
              </RadioOption>
            </RadioGroupContainer>
            
            <FormGroup>
              <Label>
                {inputMethod === 'single' 
                  ? 'Enter your business content to convert to AI vector' 
                  : 'Enter multiple content items (one per line)'}
              </Label>
              <TextArea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={inputMethod === 'single' 
                  ? "Enter product descriptions, support queries, legal clauses, or any text you want to analyze..."
                  : "Enter multiple items, one per line.\nEach will be converted into a separate vector.\nIdeal for batch processing of product descriptions, customer reviews, etc."}
              />
            </FormGroup>
            
            <TipsAccordion>
              <TipsHeader onClick={() => setShowTips(!showTips)}>
                <span>Tips for Better Results</span>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{ transform: showTips ? 'rotate(180deg)' : 'rotate(0)' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </TipsHeader>
              <TipsContent isOpen={showTips}>
                <ul style={{ paddingLeft: '20px', margin: '0' }}>
                  <li>Use complete sentences for better semantic understanding</li>
                  <li>Include relevant context to improve search accuracy</li>
                  <li>Keep content items between 50-500 characters for optimal performance</li>
                  <li>Use consistent formatting for similar types of content</li>
                  <li>For product data, include key attributes like category, features, and use cases</li>
                </ul>
              </TipsContent>
            </TipsAccordion>
            
            <SectionTitle>Sample Content Library</SectionTitle>
            <SampleLibrary>
              {businessTemplates.map((template, index) => (
                <SampleCard key={index} onClick={() => applySampleText(index)}>
                  <SampleTitle>{template.name}</SampleTitle>
                  <SampleDescription>{template.description}</SampleDescription>
                  <ActionButton variant="outline" style={{ width: '100%' }}>
                    Use this template
                  </ActionButton>
                </SampleCard>
              ))}
            </SampleLibrary>
          </>
        )}
        
        {activeTab === 'file' && (
          <>
            <InfoBox>
              Bulk upload allows you to process large volumes of business content at once. Upload a CSV, TXT or JSON file containing your business data.
            </InfoBox>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
              accept=".txt,.csv,.json,.md"
            />
            
            {!uploadedFile ? (
              <FileUploadArea onClick={triggerFileUpload}>
                <ButtonIcon>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </ButtonIcon>
                <FileUploadText>Click to upload your business data file</FileUploadText>
                <FileUploadSubtext>
                  Supported formats: CSV (with headers), TXT (one item per line), JSON
                  <br />Maximum size: 10MB
                </FileUploadSubtext>
              </FileUploadArea>
            ) : (
              <>
                <UploadedFileInfo>
                  <div>
                    <strong>{uploadedFile.name}</strong> ({(uploadedFile.size / 1024).toFixed(2)} KB)
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={clearUploadedFile}>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </UploadedFileInfo>
                
                <FormGroup>
                  <Label>Content Preview (first 1000 characters)</Label>
                  <TextArea 
                    value={fileContent.substring(0, 1000) + (fileContent.length > 1000 ? '...' : '')}
                    onChange={(e) => setFileContent(e.target.value)}
                    placeholder="File content will appear here..."
                  />
                </FormGroup>
                
                <TipsAccordion>
                  <TipsHeader onClick={() => setShowTips(!showTips)}>
                    <span>File Format Guidelines</span>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      style={{ transform: showTips ? 'rotate(180deg)' : 'rotate(0)' }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </TipsHeader>
                  <TipsContent isOpen={showTips}>
                    <ul style={{ paddingLeft: '20px', margin: '0' }}>
                      <li><strong>CSV files:</strong> Include a header row, with each row representing an item to embed</li>
                      <li><strong>TXT files:</strong> Each line will be processed as a separate item</li>
                      <li><strong>JSON files:</strong> Use an array of objects with a "text" field for each item</li>
                      <li>For product catalogs, include SKU/ID columns to maintain reference to original data</li>
                    </ul>
                  </TipsContent>
                </TipsAccordion>
              </>
            )}
          </>
        )}
        
        {activeTab === 'compare' && (
          <>
            <InfoBox>
              Compare any two content items to measure their semantic similarity. This helps identify related content, detect duplicates, or understand relationships between different business texts.
            </InfoBox>
            
            <ComparisonContainer>
              <ComparisonCard>
                <Label>First Content Item</Label>
                <select 
                  value={compareItem1 ? embeddingsHistory.indexOf(compareItem1) : ''}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setCompareItem1(idx >= 0 ? embeddingsHistory[idx] : null);
                    setSimilarityScore(null);
                  }}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '6px',
                    backgroundColor: '#1e232d',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <option value="">Select content to compare</option>
                  {embeddingsHistory.map((item, idx) => (
                    <option key={`first-${idx}`} value={idx}>
                      {item.text.substring(0, 30)}{item.text.length > 30 ? '...' : ''}
                    </option>
                  ))}
                </select>
                
                {compareItem1 && (
                  <EmbeddingText>
                    {compareItem1.text}
                  </EmbeddingText>
                )}
              </ComparisonCard>
              
              <ComparisonCard>
                <Label>Second Content Item</Label>
                <select 
                  value={compareItem2 ? embeddingsHistory.indexOf(compareItem2) : ''}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setCompareItem2(idx >= 0 ? embeddingsHistory[idx] : null);
                    setSimilarityScore(null);
                  }}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '6px',
                    backgroundColor: '#1e232d',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <option value="">Select content to compare</option>
                  {embeddingsHistory.map((item, idx) => (
                    <option key={`second-${idx}`} value={idx}>
                      {item.text.substring(0, 30)}{item.text.length > 30 ? '...' : ''}
                    </option>
                  ))}
                </select>
                
                {compareItem2 && (
                  <EmbeddingText>
                    {compareItem2.text}
                  </EmbeddingText>
                )}
              </ComparisonCard>
            </ComparisonContainer>
            
            <Button
              onClick={handleCompare}
              disabled={!compareItem1 || !compareItem2}
              style={{ marginTop: '20px' }}
            >
              <ButtonIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 9l3 3-3 3M13 15h3" />
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                </svg>
              </ButtonIcon>
              Calculate Content Similarity
            </Button>
            
            {similarityScore !== null && (
              <SimilarityScore>
                <SimilarityValue>{(similarityScore * 100).toFixed(2)}%</SimilarityValue>
                <SimilarityLabel>Content Similarity Score</SimilarityLabel>
                
                <div style={{ marginTop: '15px', fontSize: '0.9rem', opacity: '0.9' }}>
                  {similarityScore > 0.9 ? (
                    'These items are extremely similar and likely contain the same core information.'
                  ) : similarityScore > 0.75 ? (
                    'These items are very closely related and cover similar topics.'
                  ) : similarityScore > 0.5 ? (
                    'These items share some common themes but have distinct differences.'
                  ) : similarityScore > 0.3 ? (
                    'These items are somewhat related but mostly different.'
                  ) : (
                    'These items have little in common and appear to be unrelated.'
                  )}
                </div>
                
                {showChart && compareItem1 && compareItem2 && (
                  <ChartContainer>
                    {dimensionsToShow.map((dimension, idx) => {
                      const val1 = compareItem1.embedding[dimension];
                      const val2 = compareItem2.embedding[dimension];
                      const pos = 4 + (idx * 40); // Position along x-axis
                      
                      return (
                        <div key={dimension} style={{ position: 'absolute', bottom: 0, left: `${pos}px` }}>
                          <ChartBar 
                            height={Math.abs(val1 * 100)}
                            style={{ left: '0px' }}
                            onMouseEnter={() => showEmbeddingDimensionTooltip(dimension, val1)}
                            onMouseLeave={hideTooltip}
                          />
                          <ChartBar 
                            height={Math.abs(val2 * 100)}
                            style={{ left: '35px' }}
                            onMouseEnter={() => showEmbeddingDimensionTooltip(dimension, val2)}
                            onMouseLeave={hideTooltip}
                          />
                          {tooltipVisible && (
                            <Tooltip>{tooltipText}</Tooltip>
                          )}
                        </div>
                      );
                    })}
                  </ChartContainer>
                )}
                
                <ButtonGroup style={{ justifyContent: 'center', marginTop: '20px' }}>
                  <ActionButton variant="primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Generate Similarity Report
                  </ActionButton>
                  
                  <ActionButton variant="outline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    Export Results
                  </ActionButton>
                </ButtonGroup>
              </SimilarityScore>
            )}
          </>
        )}
        
        {activeTab === 'integrations' && (
          <>
            <InfoBox>
              Connect your AI vector embeddings with your existing business systems to enhance search, recommendations, 
              and analytics capabilities across your organization.
            </InfoBox>
            
            <div style={{ marginTop: '20px', marginBottom: '30px' }}>
              <SectionTitle>Available Enterprise Integrations</SectionTitle>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                <IntegrationBadge platform="salesforce">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  Salesforce
                </IntegrationBadge>
                
                <IntegrationBadge platform="hubspot">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.2 19.8h4v-8h-4v8zm5.8 0h4v-8h-4v8zm5.8 0h4v-8h-4v8zM18 7.4c0-1.9-1.8-3.4-3.8-3.4S10.4 5.5 10.4 7.4s1.8 3.4 3.8 3.4S18 9.3 18 7.4zM7.4 7.4C7.4 5.5 5.6 4 3.6 4S0 5.5 0 7.4s1.8 3.4 3.8 3.4 3.6-1.5 3.6-3.4z"/>
                  </svg>
                  HubSpot
                </IntegrationBadge>
                
                <IntegrationBadge platform="shopify">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  Shopify
                </IntegrationBadge>
                
                <IntegrationBadge platform="zendesk">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                  </svg>
                  Zendesk
                </IntegrationBadge>
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <h4>Choose an integration to enable AI capabilities:</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><strong>CRM Enhancement:</strong> Improve customer search and recommendations</li>
                  <li><strong>E-commerce:</strong> Semantic product search and personalized recommendations</li>
                  <li><strong>Customer Support:</strong> Automated ticket routing and knowledge base suggestions</li>
                  <li><strong>Content Management:</strong> Smart content tagging and organization</li>
                </ul>
              </div>
              
              <ButtonGroup>
                <ActionButton 
                  variant="primary"
                  onClick={() => setIntegrationsExpanded(!integrationsExpanded)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  Connect to Business System
                </ActionButton>
                
                <ActionButton variant="outline">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Contact Integration Team
                </ActionButton>
              </ButtonGroup>
              
              {integrationsExpanded && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                  <h4 style={{ marginTop: '0' }}>Request Integration Setup</h4>
                  <p>Our team will help you connect your vector embeddings to your existing systems.</p>
                  
                  <FormGroup>
                    <Label>Business System to Connect</Label>
                    <TemplateSelector>
                      <option value="">Select a system...</option>
                      <option value="salesforce">Salesforce</option>
                      <option value="hubspot">HubSpot</option>
                      <option value="shopify">Shopify</option>
                      <option value="zendesk">Zendesk</option>
                      <option value="custom">Custom API Integration</option>
                    </TemplateSelector>
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Integration Purpose</Label>
                    <TextArea 
                      placeholder="Describe how you plan to use AI embeddings in your business system..."
                      rows={4}
                    />
                  </FormGroup>
                  
                  <ActionButton variant="primary">
                    Submit Integration Request
                  </ActionButton>
                </div>
              )}
            </div>
          </>
        )}
        
        {(activeTab === 'text' || activeTab === 'file') && (
          <Button 
            onClick={handleCreateEmbedding}
            disabled={isLoading || (activeTab === 'text' && !inputText.trim()) || (activeTab === 'file' && !fileContent.trim())}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Processing Business Content...
              </>
            ) : (
              <>
                <ButtonIcon>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12L12 3L3 12H7V19C7 19.5304 7.21071 20.0391 7.58579 20.4142C7.96086 20.7893 8.46957 21 9 21H15C15.5304 21 16.0391 20.7893 16.4142 20.4142C16.7893 20.0391 17 19.5304 17 19V12H21Z" />
                  </svg>
                </ButtonIcon>
                {activeTab === 'file' ? 'Process Business Data' : 'Create AI Vectors'}
              </>
            )}
          </Button>
        )}
      </Card>
      

      {displayEmbeddings.length > 0 && (
        <>
          <SectionTitle>
            Business Content Repository
            <SectionTitleControls>
              <ActionButton 
                variant="outline" 
                onClick={handleExportAllEmbeddings}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Export All
              </ActionButton>
              {searchQuery && <Badge type="info">{filteredEmbeddings.length} results</Badge>}
            </SectionTitleControls>
          </SectionTitle>
          
          {displayEmbeddings.map((item, index) => (
            <Card 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <CardTitle>
                {item.text.length > 30 
                  ? `${item.text.substring(0, 30)}...` 
                  : item.text}
                <Badge type="success">AI-Ready Vector</Badge>
              </CardTitle>
              
              <div>
                <Label>Business Content</Label>
                <EmbeddingText>
                  {item.text}
                </EmbeddingText>
              </div>
              
              <div>
                <EmbeddingDimension>
                  <span>AI Vector Representation</span>
                  <span>{item.dimensions} dimensions</span>
                </EmbeddingDimension>
                
                <EmbeddingVisualizer>
                  <HeatmapGrid>
                    {item.embedding.slice(0, 256).map((value, i) => (
                      <HeatmapCell 
                        key={i} 
                        value={value} 
                        title={`Dimension ${i+1}: ${value.toFixed(4)}`}
                      />
                    ))}
                  </HeatmapGrid>
                  
                  <EmbeddingMetric>
                    <MetricItem>
                      <MetricLabel>Created</MetricLabel>
                      <MetricValue>{formatDate(item.created)}</MetricValue>
                    </MetricItem>
                    
                    <MetricItem>
                      <MetricLabel>Vector Quality</MetricLabel>
                      <MetricValue>{item.norm.toFixed(2)}</MetricValue>
                    </MetricItem>
                    
                    <MetricItem>
                      <MetricLabel>Content Length</MetricLabel>
                      <MetricValue>{item.text.length} chars</MetricValue>
                    </MetricItem>
                  </EmbeddingMetric>
                </EmbeddingVisualizer>
                
                <EmbeddingControls>
                  <ButtonGroup>
                    <ActionButton 
                      variant="primary"
                      onClick={() => handleDownloadEmbedding(item, index)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" />
                      </svg>
                      Export
                    </ActionButton>
                    
                    <ActionButton onClick={() => handleCopyEmbedding(item.embedding)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.083 2.57C15.7094 2.20466 15.2076 2.00007 14.685 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V4Z" />
                        <path d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V9C4 8.46957 4.21071 7.96086 4.58579 7.58579C4.96086 7.21071 5.46957 7 6 7H8" />
                      </svg>
                      Copy Vector
                    </ActionButton>
                    
                    {activeTab === 'compare' && (
                      <ActionButton 
                        onClick={() => {
                          if (compareItem1 === null) {
                            setCompareItem1(item);
                          } else if (compareItem2 === null) {
                            setCompareItem2(item);
                          } else {
                            setCompareItem1(item);
                            setCompareItem2(null);
                          }
                          setSimilarityScore(null);
                        }}
                        variant="outline"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                        Use in Comparison
                      </ActionButton>
                    )}
                  </ButtonGroup>
                  
                  <ActionButton 
                    variant="outline" 
                    onClick={() => handleDeleteEmbedding(index)}
                    style={{ color: '#f44336', borderColor: 'rgba(244, 67, 54, 0.3)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                    </svg>
                    Remove
                  </ActionButton>
                </EmbeddingControls>
              </div>
            </Card>
          ))}
        </>
      )}
    </PageContainer>
  );
};

export default CreateEmbeddings;