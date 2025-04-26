import { useState, useRef, useCallback, useEffect } from 'react'
import styled from '@emotion/styled'
import axios from 'axios'
import { THEME } from '../../theme'
import { motion, AnimatePresence } from 'framer-motion'

// Import required for PDF parsing
// Note: You'll need to install pdfjs-dist: npm install pdfjs-dist
import * as pdfjs from 'pdfjs-dist'
// Set the PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

// Import the config
import { config } from '../../config';

// Use the API base URL from config
const API_BASE_URL = '/api';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const PageHeader = styled.div`
  margin-bottom: 30px;
`

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 12px;
  background: linear-gradient(90deg, ${THEME.primaryColor}, #a3a8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
`

const ValueProposition = styled.div`
  display: flex;
  gap: 20px;
  margin: 30px 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const ValueCard = styled.div`
  background: linear-gradient(135deg, rgba(75, 86, 210, 0.1), rgba(75, 86, 210, 0.05));
  border-radius: 10px;
  padding: 20px;
  flex: 1;
  border-left: 3px solid ${THEME.primaryColor};
  
  h3 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.1rem;
    color: white;
  }
  
  p {
    margin: 0;
    line-height: 1.5;
    opacity: 0.8;
    font-size: 0.95rem;
  }
`

const Card = styled.div`
  background-color: ${THEME.secondaryBgColor};
  border-radius: 10px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  margin-bottom: 24px;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
`

const CardTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 18px;
  font-size: 1.25rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 8px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background-color: ${THEME.primaryColor};
    border-radius: 2px;
  }
`

const FormGroup = styled.div`
  margin-bottom: 20px;
`

const Label = styled.label`
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  font-size: 0.95rem;
`

const Input = styled.input`
  width: 100%;
  background-color: #262b36;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px 14px;
  color: ${THEME.textColor};
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${THEME.primaryColor};
    box-shadow: 0 0 0 3px rgba(75, 86, 210, 0.2);
  }
  
  &:hover:not(:focus) {
    border-color: rgba(255, 255, 255, 0.2);
  }
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  background-color: #262b36;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 14px;
  color: ${THEME.textColor};
  font-family: inherit;
  resize: vertical;
  font-size: 0.95rem;
  line-height: 1.5;
  
  &:focus {
    outline: none;
    border-color: ${THEME.primaryColor};
    box-shadow: 0 0 0 3px rgba(75, 86, 210, 0.2);
  }
  
  &:hover:not(:focus) {
    border-color: rgba(255, 255, 255, 0.2);
  }
`

const Button = styled.button`
  background-color: ${THEME.primaryColor};
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
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
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

const SecondaryButton = styled(Button)`
  background-color: rgba(255, 255, 255, 0.1);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
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
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-weight: 500;
  text-align: left;
  
  &:hover {
    background-color: #303540;
  }
  
  span:last-child {
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
`

const StatCard = styled.div`
  background-color: #262b36;
  border-radius: 8px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: ${THEME.primaryColor};
`

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  text-align: center;
`

const DocumentList = styled.div`
  margin-top: 24px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 6px;
  
  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #4a4d57 #1e2029;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1e2029;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #4a4d57;
    border-radius: 4px;
  }
`

const DocumentItem = styled.div`
  background-color: #262b36;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`

const DocumentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  align-items: center;
`

const DocumentTitle = styled.div`
  font-weight: 600;
  font-size: 1rem;
`

const DocumentMeta = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const MetaTag = styled.span`
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
`

const DocumentText = styled.div`
  font-size: 0.9rem;
  background-color: #1a1e27;
  padding: 12px;
  border-radius: 6px;
  max-height: 120px;
  overflow-y: auto;
  line-height: 1.5;
  border-left: 3px solid ${THEME.primaryColor};
`

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const FileUploadContainer = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  background-color: rgba(255, 255, 255, 0.02);
  margin-bottom: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`

const HiddenFileInput = styled.input`
  display: none;
`

const FileUploadIcon = styled.div`
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 8px;
`

const FileUploadText = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  text-align: center;
  font-weight: 500;
`

const FileUploadHelper = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  text-align: center;
  margin-top: 8px;
`

const FileInfoBox = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.07);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`

const FileIcon = styled.div`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  background-color: rgba(255, 255, 255, 0.1);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
`

const FileDetails = styled.div`
  flex: 1;
`

const FileName = styled.div`
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 1rem;
`

const FileSize = styled.div`
  font-size: 0.85rem;
  opacity: 0.7;
`

const FileActions = styled.div`
  display: flex;
  gap: 10px;
`

const ActionButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: white;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`

const ChunkSettingsContainer = styled.div`
  background-color: #1a1e27;
  border-radius: 8px;
  padding: 18px;
  margin-bottom: 24px;
`

const ChunkingOptions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
`

const ChunkOption = styled.div<{ selected: boolean }>`
  background-color: ${props => props.selected ? THEME.primaryColor : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  
  &:hover {
    background-color: ${props => props.selected ? THEME.primaryColor : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-2px);
  }
`

const ProgressContainer = styled.div`
  margin: 16px 0 24px;
`

const ProgressBarOuter = styled.div`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  height: 10px;
  margin-bottom: 8px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
`

const ProgressBarInner = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress}%;
  background-color: ${THEME.primaryColor};
  border-radius: 6px;
  transition: width 0.3s ease;
`

const ProgressText = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
  text-align: right;
  margin-top: 6px;
`

const ProcessingOptions = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`

const OptionCard = styled.div<{ active: boolean }>`
  background-color: ${props => props.active ? 'rgba(75, 86, 210, 0.1)' : '#262b36'};
  border: 1px solid ${props => props.active ? THEME.primaryColor : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  flex: 1;
  min-width: 150px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'rgba(75, 86, 210, 0.15)' : '#303540'};
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`

const OptionTitle = styled.div`
  font-weight: 600;
  margin-bottom: 6px;
`

const OptionDescription = styled.div`
  font-size: 0.85rem;
  opacity: 0.7;
  line-height: 1.4;
`

// Modal components
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`

const ModalContainer = styled(motion.div)`
  background-color: ${THEME.secondaryBgColor};
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${THEME.primaryColor}, #6c5ce7);
  }
`

const ModalTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.5rem;
  color: white;
  display: flex;
  align-items: center;
  
  & > span {
    margin-right: 12px;
    font-size: 1.8rem;
  }
`

const ModalContent = styled.div`
  margin-bottom: 24px;
  font-size: 1rem;
  line-height: 1.6;
`

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
`

const CloseButton = styled(Button)`
  background-color: #3A3F4C;
  
  &:hover {
    background-color: #4A4F5C;
  }
`

const ApiStatusBadge = styled.div<{ isOnline: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 12px;
  background-color: ${props => props.isOnline 
    ? 'rgba(76, 175, 80, 0.1)' 
    : 'rgba(244, 67, 54, 0.1)'
  };
  color: ${props => props.isOnline 
    ? '#4CAF50' 
    : '#F44336'
  };
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.isOnline 
      ? '#4CAF50' 
      : '#F44336'
    };
  }
`

const ErrorMessage = styled.div`
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 3px solid #F44336;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 6px;
  color: #F44336;
  font-size: 0.95rem;
`

// New business-friendly components
const InfoBox = styled.div`
  background-color: rgba(33, 150, 243, 0.1);
  border-left: 3px solid #2196F3;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 6px;
  font-size: 0.95rem;
  line-height: 1.5;
`

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 30px 0;
  
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
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    
    &::before {
      display: none;
    }
  }
`

const Step = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 1;
  
  .step-circle {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: ${props => 
      props.completed ? THEME.primaryColor : 
      props.active ? 'rgba(75, 86, 210, 0.2)' : 
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
    font-size: 0.9rem;
    color: ${props => props.active || props.completed ? 'white' : 'rgba(255, 255, 255, 0.5)'};
    font-weight: ${props => props.active || props.completed ? '500' : '400'};
    text-align: center;
  }
  
  @media (max-width: 768px) {
    flex-direction: row;
    gap: 10px;
    
    .step-circle {
      margin-bottom: 0;
    }
  }
`

const UseCaseTag = styled.span`
  background-color: rgba(75, 86, 210, 0.15);
  color: white;
  font-size: 0.85rem;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 500;
  margin-right: 8px;
  margin-bottom: 8px;
  display: inline-block;
`

const UseCasesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 15px 0;
`

const TemplateSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
`

const TemplateCard = styled.div<{ selected: boolean }>`
  background-color: ${props => props.selected ? 'rgba(75, 86, 210, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.selected ? THEME.primaryColor : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.selected ? THEME.primaryColor : 'rgba(255, 255, 255, 0.2)'};
  }
`

const TemplateIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 10px;
`

const TemplateTitle = styled.div`
  font-weight: 600;
  margin-bottom: 5px;
`

const TemplateDescription = styled.div`
  font-size: 0.85rem;
  opacity: 0.7;
  line-height: 1.4;
`

const BusinessValue = styled.div`
  background: linear-gradient(135deg, #1a1e27, #262b36);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  border-left: 4px solid ${THEME.primaryColor};
`

const BusinessValueTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2rem;
`

const BenefitsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
`

const BenefitItem = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
`

const BenefitIcon = styled.div`
  font-size: 1.2rem;
  color: ${THEME.primaryColor};
  flex-shrink: 0;
`

const BenefitText = styled.div`
  font-size: 0.95rem;
  line-height: 1.4;
`

const FeatureTag = styled.span`
  background-color: rgba(75, 86, 210, 0.1);
  border: 1px solid rgba(75, 86, 210, 0.3);
  color: white;
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 8px;
`

const TipsAccordion = styled.div`
  margin: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
`

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
`

const TipsContent = styled.div<{ isOpen: boolean }>`
  padding: ${props => props.isOpen ? '15px' : '0 15px'};
  max-height: ${props => props.isOpen ? '1000px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${props => props.isOpen ? '1' : '0'};
`

// Types
interface Document {
  id: string;
  text: string;
  source: string;
  category: string;
  filename?: string;
  metadata: Record<string, any>;
}

interface FileInfo {
  file: File;
  name: string;
  size: string;
  type: string;
  content?: string;
  chunks?: string[];
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  collection: string;
}

// Success modal component
const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, count, collection }) => {
  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <ModalContainer
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <ModalTitle><span>✅</span> Success</ModalTitle>
            <ModalContent>
              <p>Your content is now ready for AI-powered search!</p>
              <p>We've successfully processed <strong>{count} content items</strong> into the <strong>'{collection}'</strong> knowledge base.</p>
              <p>You can now use our powerful semantic search to find information with natural language queries, even when the exact keywords aren't present.</p>
            </ModalContent>
            <ModalActions>
              <CloseButton onClick={onClose}>
                Continue
              </CloseButton>
            </ModalActions>
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

// Collection templates for different business use cases
const collectionTemplates = [
  {
    id: 'knowledge_base',
    name: 'Knowledge Base',
    description: 'Support documentation, FAQs, and help articles',
    icon: '📚',
    defaultChunk: 'paragraphs'
  },
  {
    id: 'product_catalog',
    name: 'Product Catalog',
    description: 'Product descriptions, specifications, and features',
    icon: '🛍️',
    defaultChunk: 'products'
  },
  {
    id: 'legal_documents',
    name: 'Legal Documents',
    description: 'Contracts, policies, and regulatory content',
    icon: '⚖️',
    defaultChunk: 'sections'
  },
  {
    id: 'employee_handbook',
    name: 'Employee Resources',
    description: 'HR policies, procedures, and guidelines',
    icon: '👥',
    defaultChunk: 'paragraphs'
  },
  {
    id: 'research',
    name: 'Research & Reports',
    description: 'Market research, white papers, and analysis',
    icon: '📊',
    defaultChunk: 'sections'
  },
  {
    id: 'custom',
    name: 'Custom Collection',
    description: 'Create a custom database for your specific needs',
    icon: '🔧',
    defaultChunk: 'paragraphs'
  }
];

// Main component
const IndexDocuments: React.FC = () => {
  const [collectionName, setCollectionName] = useState('my_knowledge_base');
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
  const [mParam, setMParam] = useState(16);
  const [efConstruction, setEfConstruction] = useState(200);
  const [tuneParameters, setTuneParameters] = useState(false);
  
  const [documentText, setDocumentText] = useState('');
  const [documentSource, setDocumentSource] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [documentCategory, setDocumentCategory] = useState('');
  const [customMetadata, setCustomMetadata] = useState('');
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(100);
  const [processingMethod, setProcessingMethod] = useState<'chunks' | 'pages' | 'whole'>('chunks');
  
  // Modal state
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalData, setModalData] = useState({ count: 0, collection: '' });
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Business-friendly state additions
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [businessValueVisible, setBusinessValueVisible] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/status`);
        setApiStatus(response.data?.status === 'ok');
      } catch (error) {
        console.warn('API status check failed:', error);
        setApiStatus(false);
      }
    };
    
    checkApiStatus();
  }, []);
  
  // Handle template selection
  useEffect(() => {
    if (selectedTemplate) {
      const template = collectionTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        // Set a meaningful collection name based on the template
        if (template.id !== 'custom') {
          setCollectionName(template.id);
        }
        
        // Set appropriate chunking method based on template
        if (template.defaultChunk === 'paragraphs') {
          setProcessingMethod('chunks');
          setChunkSize(1500);
          setChunkOverlap(150);
        } else if (template.defaultChunk === 'sections') {
          setProcessingMethod('chunks');
          setChunkSize(3000);
          setChunkOverlap(300);
        } else if (template.defaultChunk === 'products') {
          setProcessingMethod('chunks');
          setChunkSize(1000);
          setChunkOverlap(50);
        }
      }
    }
  }, [selectedTemplate]);
  
  const formatIndexApiUrl = (collectionName: string) => {
    return `${API_BASE_URL}/index/${collectionName}`;
  };
  
  // Advance to next step in workflow
  const advanceStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleAddDocument = () => {
    if (!documentText.trim()) return;
    
    let metadata: Record<string, any> = {};
    
    if (customMetadata.trim()) {
      try {
        metadata = JSON.parse(customMetadata);
      } catch (error) {
        setApiError('Invalid format for additional properties');
        return;
      }
    }
    
    const newDocument: Document = {
      id: documentId || `doc_${Date.now()}`,
      text: documentText,
      source: documentSource,
      category: documentCategory,
      metadata: {
        ...metadata,
        source: documentSource,
        category: documentCategory
      }
    };
    
    setDocuments([...documents, newDocument]);
    
    // Clear form
    setDocumentText('');
    setDocumentSource('');
    setDocumentId('');
    setDocumentCategory('');
    setCustomMetadata('');
    setApiError(null);
    
    // Advance to next step
    if (currentStep === 1) {
      advanceStep();
    }
  };
  
  const handleFileSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setApiError('File size exceeds the 10MB limit. Please upload a smaller file.');
      return;
    }
    
    // Format file size for display
    const fileSizeKB = file.size / 1024;
    const fileSizeMB = fileSizeKB / 1024;
    const fileSizeFormatted = fileSizeMB >= 1 
      ? `${fileSizeMB.toFixed(2)} MB` 
      : `${fileSizeKB.toFixed(2)} KB`;
    
    setUploadedFile({
      file,
      name: file.name,
      size: fileSizeFormatted,
      type: file.type
    });
    
    setApiError(null);
    
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };
  
  const removeFile = () => {
    setUploadedFile(null);
    setProcessingProgress(0);
  };
  
  // This function will extract text from a PDF file
  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      // Convert the file to an ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Update progress as each page is processed
      setProcessingProgress(5); // Initial progress
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n\n';
        
        // Update progress (5% initial + 95% distributed across pages)
        setProcessingProgress(5 + Math.floor((i / pdf.numPages) * 95));
      }
      
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };
  
  // Function to read text from a text file
  const readTextFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('File read error'));
      };
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setProcessingProgress(progress);
        }
      };
      
      reader.readAsText(file);
    });
  };
  
  // Function to split text into chunks
  const splitIntoChunks = (text: string, size: number, overlap: number): string[] => {
    const chunks: string[] = [];
    let currentIndex = 0;
    
    while (currentIndex < text.length) {
      // Get chunk with specified size
      const chunk = text.substring(currentIndex, currentIndex + size);
      chunks.push(chunk);
      
      // Move index forward, taking overlap into account
      currentIndex += size - overlap;
      
      // Ensure we don't go backwards if overlap > size
      if (currentIndex <= 0) currentIndex = size;
    }
    
    return chunks;
  };
  
  // Function to split PDF text by pages
  const splitByPages = (text: string): string[] => {
    // Simple approach: split by double newlines which often indicate page breaks
    return text.split(/\n\s*\n/).filter(page => page.trim().length > 0);
  };
  
  const processFile = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    setProcessingProgress(0);
    setApiError(null);
    
    try {
      let fileContent = '';
      
      // Extract text based on file type
      if (uploadedFile.file.type === 'application/pdf') {
        fileContent = await extractTextFromPdf(uploadedFile.file);
      } else if (uploadedFile.file.type === 'text/plain' || uploadedFile.file.name.endsWith('.txt')) {
        fileContent = await readTextFile(uploadedFile.file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or text file.');
      }
      
      // Store the file content
      const updatedFile = { ...uploadedFile, content: fileContent };
      
      // Process according to selected method
      let documentFragments: string[] = [];
      
      if (processingMethod === 'chunks') {
        documentFragments = splitIntoChunks(fileContent, chunkSize, chunkOverlap);
      } else if (processingMethod === 'pages') {
        documentFragments = splitByPages(fileContent);
      } else {
        // 'whole' method - use the entire document as one chunk
        documentFragments = [fileContent];
      }
      
      updatedFile.chunks = documentFragments;
      setUploadedFile(updatedFile);
      
      // Add these chunks as documents
      const newDocuments = documentFragments.map((fragment, index) => {
        return {
          id: `${uploadedFile.name.replace(/\.[^/.]+$/, '')}_${index}`,
          text: fragment,
          source: uploadedFile.name,
          category: documentCategory || 'uploaded_document',
          filename: uploadedFile.name,
          metadata: {
            source: uploadedFile.name,
            category: documentCategory || 'uploaded_document',
            chunk_index: index,
            total_chunks: documentFragments.length,
            file_size: uploadedFile.size,
            file_type: uploadedFile.type,
            processing_method: processingMethod
          }
        };
      });
      
      setDocuments([...documents, ...newDocuments]);
      
      // Clear the uploaded file after processing
      setUploadedFile(null);
      
      // Advance to step 2 after processing
      if (currentStep === 1) {
        advanceStep();
      }
      
    } catch (error) {
      console.error('Error processing file:', error);
      setApiError(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(100);
    }
  };
  
  const handleIndexDocuments = async () => {
    if (documents.length === 0) return;
    
    setIsLoading(true);
    setApiError(null);
    
    try {
      // Create API URL with collection name
      const apiUrl = formatIndexApiUrl(collectionName);
      
      // Prepare the payload
      const indexParams = {
        documents: documents.map(doc => ({
          id: doc.id,
          text: doc.text,
          metadata: doc.metadata
        })),
        ...(mParam > 0 ? { m: mParam } : {}),
        ...(efConstruction > 0 ? { ef_construction: efConstruction } : {}),
        ...(tuneParameters ? { tune_parameters: true } : {})
      };
      
      // Make actual API call
      const response = await axios.post(apiUrl, indexParams);
      
      if (response.data) {
        // For APIs that don't return an explicit status field
        // Consider it a success if we got a response without an error
        if (!response.data.error) {
          // Show success modal
          setModalData({
            count: documents.length,
            collection: collectionName
          });
          setModalIsOpen(true);
          
          // Clear documents after successful indexing
          setDocuments([]);
          
          // Advance to step 3
          setCurrentStep(3);
        } else {
          // The API returned an error message
          throw new Error(response.data.error);
        }
      } else {
        // No data in response
        throw new Error('No response data received from API');
      }
    } catch (error) {
      console.error('Error indexing documents:', error);
      if (error instanceof Error) {
        setApiError(error.message || 'Error during document indexing');
      } else {
        setApiError('Error during document indexing');
      }
      // Additional error handling...
    } finally {
      setIsLoading(false);
    }
  };
  
  const getUniqueCategories = () => {
    const categories = new Set<string>();
    documents.forEach(doc => {
      if (doc.category) categories.add(doc.category);
    });
    return categories.size;
  };
  
  const getAverageDocumentLength = () => {
    if (documents.length === 0) return 0;
    const totalLength = documents.reduce((sum, doc) => sum + doc.text.length, 0);
    return Math.round(totalLength / documents.length);
  };
  
  // Calculate total document count, including original + uploaded
  const getTotalDocumentCount = () => {
    return documents.length;
  };
  
  // Calculate the estimated monthly time savings based on document count
  const calculateTimeSavings = () => {
    const searchesPerMonth = documents.length * 15; // Assume each document searched 15 times per month
    const manualSearchTime = 3; // minutes
    const aiSearchTime = 0.1; // minutes (6 seconds)
    
    const timeSaved = searchesPerMonth * (manualSearchTime - aiSearchTime);
    return Math.round(timeSaved / 60); // convert to hours
  };
  
  // Get recommended chunk size based on content type
  const getRecommendedChunkSize = (contentType: string) => {
    switch(contentType) {
      case 'technical':
        return 2000;
      case 'marketing':
        return 1000;
      case 'legal':
        return 3000;
      default:
        return 1500;
    }
  };
  
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>AI-Powered Knowledge Base</PageTitle>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.5', maxWidth: '900px', opacity: '0.9' }}>
          Transform your business content into a searchable knowledge base that understands 
          natural language questions and delivers precise answers.
        </p>
      </PageHeader>
      
      {businessValueVisible && (
        <BusinessValue>
          <BusinessValueTitle>
            Business Benefits
            <ActionButton 
              style={{ float: 'right', padding: '4px' }} 
              onClick={() => setBusinessValueVisible(false)}
              title="Close"
            >
              ✕
            </ActionButton>
          </BusinessValueTitle>
          
          <p>Our AI-powered knowledge base enhances your team's productivity and customer experience:</p>
          
          <UseCasesContainer>
            <UseCaseTag>Customer Support</UseCaseTag>
            <UseCaseTag>Sales Enablement</UseCaseTag>
            <UseCaseTag>Employee Training</UseCaseTag>
            <UseCaseTag>Product Documentation</UseCaseTag>
            <UseCaseTag>Knowledge Retention</UseCaseTag>
          </UseCasesContainer>
          
          <BenefitsList>
            <BenefitItem>
              <BenefitIcon>⏱️</BenefitIcon>
              <BenefitText>
                <strong>Save Time</strong>: Employees find answers in seconds, not minutes
              </BenefitText>
            </BenefitItem>
            <BenefitItem>
              <BenefitIcon>📈</BenefitIcon>
              <BenefitText>
                <strong>Boost Productivity</strong>: Reduce time spent searching for information by up to 35%
              </BenefitText>
            </BenefitItem>
            <BenefitItem>
              <BenefitIcon>👥</BenefitIcon>
              <BenefitText>
                <strong>Improve Consistency</strong>: Everyone accesses the same accurate information
              </BenefitText>
            </BenefitItem>
            <BenefitItem>
              <BenefitIcon>🔎</BenefitIcon>
              <BenefitText>
                <strong>Natural Language Search</strong>: Find information even when exact keywords aren't used
              </BenefitText>
            </BenefitItem>
          </BenefitsList>
        </BusinessValue>
      )}
      
      {apiError && (
        <ErrorMessage>
          {apiError}
        </ErrorMessage>
      )}
      
      <StepIndicator>
        <Step active={currentStep === 1} completed={currentStep > 1}>
          <div className="step-circle">
            {currentStep > 1 ? (
              <span>✓</span>
            ) : 1}
          </div>
          <div className="step-label">Add Content</div>
        </Step>
        
        <Step active={currentStep === 2} completed={currentStep > 2}>
          <div className="step-circle">
            {currentStep > 2 ? (
              <span>✓</span>
            ) : 2}
          </div>
          <div className="step-label">Review & Process</div>
        </Step>
        
        <Step active={currentStep === 3} completed={false}>
          <div className="step-circle">3</div>
          <div className="step-label">Activate & Use</div>
        </Step>
      </StepIndicator>
      
      <Card>
        <CardTitle>
          Choose Knowledge Base Type
          <FeatureTag>Step 1</FeatureTag>
        </CardTitle>
        
        <InfoBox>
          Select the type of content you're adding to help us optimize how your information is processed for the best search results.
        </InfoBox>
        
        <TemplateSelector>
          {collectionTemplates.map(template => (
            <TemplateCard 
              key={template.id}
              selected={selectedTemplate === template.id}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <TemplateIcon>{template.icon}</TemplateIcon>
              <TemplateTitle>{template.name}</TemplateTitle>
              <TemplateDescription>{template.description}</TemplateDescription>
            </TemplateCard>
          ))}
        </TemplateSelector>
        
        <FormGroup>
          <Label htmlFor="collection-name">Knowledge Base Name</Label>
          <Input 
            id="collection-name"
            type="text" 
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder="Enter a name for your knowledge base"
          />
          <div style={{ fontSize: '0.85rem', opacity: '0.7', marginTop: '5px' }}>
            Choose a descriptive name to identify this knowledge base (e.g., "product_documentation", "support_articles")
          </div>
        </FormGroup>
        
        <ExpanderHeader 
          onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
          aria-expanded={advancedOptionsOpen}
        >
          <span>Advanced Settings (Optional)</span>
          <span style={{ transform: advancedOptionsOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
        </ExpanderHeader>
        
        <ExpanderContent isOpen={advancedOptionsOpen}>
          <TwoColumnGrid>
            <FormGroup>
              <Label htmlFor="m-param">Search Accuracy</Label>
              <Input 
                id="m-param"
                type="number" 
                value={mParam}
                onChange={(e) => setMParam(parseInt(e.target.value))}
                min="0"
                max="64"
              />
              <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '6px', lineHeight: '1.4' }}>
                Higher values improve search accuracy but may impact performance. Default (16) is ideal for most cases.
              </div>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="ef-construction">Processing Quality</Label>
              <Input 
                id="ef-construction"
                type="number" 
                value={efConstruction}
                onChange={(e) => setEfConstruction(parseInt(e.target.value))}
                min="0"
                max="500"
              />
              <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '6px', lineHeight: '1.4' }}>
                Higher values improve overall quality but increase processing time. Default (200) works well for most knowledge bases.
              </div>
            </FormGroup>
          </TwoColumnGrid>
          
          <FormGroup>
            <Label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={tuneParameters}
                onChange={(e) => setTuneParameters(e.target.checked)}
                style={{ marginRight: '10px', cursor: 'pointer' }}
                id="tune-parameters"
              />
              Optimize Performance Automatically
            </Label>
            <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '6px', lineHeight: '1.4' }}>
              Our system will analyze your content and optimize settings for the best balance of accuracy and performance.
            </div>
          </FormGroup>
        </ExpanderContent>
      </Card>
      
      {/* File Upload Card */}
      <Card>
        <CardTitle>Upload Business Content</CardTitle>
        
        <InfoBox>
          Upload your business documents, guides, manuals, or other content to make them searchable with AI. We'll process your content to enable natural language search.
        </InfoBox>
        
        {!uploadedFile ? (
          <>
            <FileUploadContainer onClick={handleFileSelection}>
              <HiddenFileInput 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt,text/plain,application/pdf"
              />
              <FileUploadIcon>📄</FileUploadIcon>
              <FileUploadText>Drag & drop a file or click to browse</FileUploadText>
              <FileUploadHelper>Supports PDF and TXT files (Max 10MB)</FileUploadHelper>
            </FileUploadContainer>
          </>
        ) : (
          <>
            <FileInfoBox>
              <FileIcon>
                {uploadedFile.type === 'application/pdf' ? '📄' : '📝'}
              </FileIcon>
              <FileDetails>
                <FileName>{uploadedFile.name}</FileName>
                <FileSize>{uploadedFile.size}</FileSize>
              </FileDetails>
              <FileActions>
                <ActionButton onClick={removeFile} title="Remove file">
                  ✕
                </ActionButton>
              </FileActions>
            </FileInfoBox>
            
            <CardTitle>Content Processing Options</CardTitle>
            <ProcessingOptions>
              <OptionCard 
                active={processingMethod === 'chunks'} 
                onClick={() => setProcessingMethod('chunks')}
              >
                <OptionTitle>Smart Sections</OptionTitle>
                <OptionDescription>Divide content into optimally-sized sections for better search results</OptionDescription>
              </OptionCard>
              
              <OptionCard 
                active={processingMethod === 'pages'} 
                onClick={() => setProcessingMethod('pages')}
              >
                <OptionTitle>Page by Page</OptionTitle>
                <OptionDescription>Each page becomes a separate searchable entry</OptionDescription>
              </OptionCard>
              
              <OptionCard 
                active={processingMethod === 'whole'} 
                onClick={() => setProcessingMethod('whole')}
              >
                <OptionTitle>Entire Document</OptionTitle>
                <OptionDescription>Process the entire document as one searchable unit</OptionDescription>
              </OptionCard>
            </ProcessingOptions>
            
            {processingMethod === 'chunks' && (
              <ChunkSettingsContainer>
                <FormGroup>
                  <Label htmlFor="chunk-size">Section Size (characters)</Label>
                  <Input 
                    id="chunk-size"
                    type="number" 
                    value={chunkSize}
                    onChange={(e) => setChunkSize(parseInt(e.target.value))}
                    min="100"
                    max="10000"
                  />
                  <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '6px' }}>
                    Recommended: 1000-2000 for general content, 2000-4000 for technical documentation
                  </div>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="chunk-overlap">Section Overlap</Label>
                  <Input 
                    id="chunk-overlap"
                    type="number" 
                    value={chunkOverlap}
                    onChange={(e) => setChunkOverlap(parseInt(e.target.value))}
                    min="0"
                    max={chunkSize - 1}
                  />
                  <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '6px' }}>
                    Overlap ensures context is maintained between sections (10-20% of section size recommended)
                  </div>
                </FormGroup>
                
                <ChunkingOptions>
                  <ChunkOption selected={chunkSize === 1000} onClick={() => setChunkSize(1000)}>
                    Short (1000)
                  </ChunkOption>
                  <ChunkOption selected={chunkSize === 2000} onClick={() => setChunkSize(2000)}>
                    Medium (2000)
                  </ChunkOption>
                  <ChunkOption selected={chunkSize === 4000} onClick={() => setChunkSize(4000)}>
                    Long (4000)
                  </ChunkOption>
                </ChunkingOptions>
              </ChunkSettingsContainer>
            )}
            
            {isProcessing && (
              <ProgressContainer>
                <ProgressBarOuter>
                  <ProgressBarInner progress={processingProgress} />
                </ProgressBarOuter>
                <ProgressText>Processing: {processingProgress}%</ProgressText>
              </ProgressContainer>
            )}
            
            <FormGroup>
              <Label htmlFor="document-category">Content Category (optional)</Label>
              <Input 
                id="document-category"
                type="text" 
                value={documentCategory}
                onChange={(e) => setDocumentCategory(e.target.value)}
                placeholder="e.g., manual, policy, product specs"
              />
              <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '6px' }}>
                Categorizing content helps organize and filter search results
              </div>
            </FormGroup>
            
            <TipsAccordion>
              <TipsHeader onClick={() => setShowTips(!showTips)}>
                <span>Tips for Better Search Results</span>
                <span style={{ transform: showTips ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
              </TipsHeader>
              <TipsContent isOpen={showTips}>
                <ul style={{ paddingLeft: '20px', margin: '0' }}>
                  <li><strong>For technical documentation:</strong> Use larger section sizes (2000-4000 characters)</li>
                  <li><strong>For product descriptions:</strong> Process each product separately with smaller sections</li>
                  <li><strong>For FAQs and procedures:</strong> "Page by Page" works well if each page contains a complete topic</li>
                  <li><strong>For legal documents:</strong> Ensure adequate overlap to maintain context between sections</li>
                  <li><strong>For mixed content:</strong> Split large documents into logical topic groups before uploading</li>
                </ul>
              </TipsContent>
            </TipsAccordion>
            
            <Button 
              onClick={processFile}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner />
                  Processing Content...
                </>
              ) : (
                'Process Content for AI Search'
              )}
            </Button>
          </>
        )}
      </Card>
      
      {documents.length > 0 && (
        <Card>
          <CardTitle>
            Content Ready for AI Search
            <FeatureTag>Step 2</FeatureTag>
          </CardTitle>
          
          <InfoBox>
            Your content has been prepared for AI-powered search. Review the items below and click "Activate AI Search" to make them searchable.
          </InfoBox>
          
          <StatsGrid>
            <StatCard>
              <StatValue>{getTotalDocumentCount()}</StatValue>
              <StatLabel>Content Items</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{getUniqueCategories() || 1}</StatValue>
              <StatLabel>Categories</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{calculateTimeSavings()}</StatValue>
              <StatLabel>Hours Saved Monthly</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{getAverageDocumentLength()}</StatValue>
              <StatLabel>Avg. Content Length</StatLabel>
            </StatCard>
          </StatsGrid>
          
          <Button 
            onClick={handleIndexDocuments}
            disabled={isLoading}
            style={{ 
              background: 'linear-gradient(135deg, #4466ff, #884DFF)', 
              padding: '14px 28px',
              fontSize: '1.1rem'
            }}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Activating AI Search...
              </>
            ) : (
              'Activate AI Search'
            )}
          </Button>
          
          <DocumentList>
            {documents.slice(0, 10).map((doc, index) => (
              <DocumentItem key={index}>
                <DocumentHeader>
                  <DocumentTitle>
                    {doc.filename || doc.source || 'Content'} {doc.metadata?.chunk_index !== undefined ? `(Part ${doc.metadata.chunk_index + 1})` : ''}
                  </DocumentTitle>
                  {doc.category && (
                    <MetaTag>
                      {doc.category}
                    </MetaTag>
                  )}
                </DocumentHeader>
                
                <DocumentMeta>
                  {doc.source && <MetaTag>Source: {doc.source}</MetaTag>}
                  {doc.filename && <MetaTag>File: {doc.filename}</MetaTag>}
                  {doc.metadata?.chunk_index !== undefined && (
                    <MetaTag>Section: {doc.metadata.chunk_index + 1}/{doc.metadata.total_chunks}</MetaTag>
                  )}
                </DocumentMeta>
                
                <DocumentText>
                  {doc.text.length > 300 ? `${doc.text.substring(0, 300)}...` : doc.text}
                </DocumentText>
              </DocumentItem>
            ))}
            {documents.length > 10 && (
              <div style={{ textAlign: 'center', padding: '10px', opacity: '0.7' }}>
                And {documents.length - 10} more content items...
              </div>
            )}
          </DocumentList>
        </Card>
      )}
      
      {currentStep === 1 && (
        <Card>
          <CardTitle>Add Content Manually</CardTitle>
          
          <InfoBox>
            Don't have a document ready? You can directly enter content to make it searchable.
          </InfoBox>
          
          <FormGroup>
            <Label htmlFor="document-text">Content Text</Label>
            <TextArea 
              id="document-text"
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Enter text content you want to make searchable (e.g., product descriptions, procedures, FAQs)"
            />
          </FormGroup>
          
          <TwoColumnGrid>
            <FormGroup>
              <Label htmlFor="document-source">Content Source</Label>
              <Input 
                id="document-source"
                type="text" 
                value={documentSource}
                onChange={(e) => setDocumentSource(e.target.value)}
                placeholder="e.g., User Manual, Company Policy"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="manual-category">Category</Label>
              <Input 
                id="manual-category"
                type="text" 
                value={documentCategory}
                onChange={(e) => setDocumentCategory(e.target.value)}
                placeholder="e.g., FAQs, Procedures, Policies"
              />
            </FormGroup>
          </TwoColumnGrid>
          
          <FormGroup>
            <Label htmlFor="document-id">Reference ID (optional)</Label>
            <Input 
              id="document-id"
              type="text" 
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder="Leave blank for auto-generated ID"
            />
            <div style={{ fontSize: '0.85rem', opacity: '0.7', marginTop: '5px' }}>
              A unique identifier for this content item (e.g., "article-123", "policy-hr-2023")
            </div>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="custom-metadata">Additional Properties (JSON format, optional)</Label>
            <TextArea 
              id="custom-metadata"
              value={customMetadata}
              onChange={(e) => setCustomMetadata(e.target.value)}
              placeholder='{"author": "John Smith", "department": "HR", "effective_date": "2023-01-15"}'
            />
            <div style={{ fontSize: '0.85rem', opacity: '0.7', marginTop: '5px' }}>
              Add extra information that might be helpful when searching or filtering this content
            </div>
          </FormGroup>
          
          <Button 
            onClick={handleAddDocument}
            disabled={!documentText.trim()}
          >
            Add to Knowledge Base
          </Button>
        </Card>
      )}
      
      {currentStep === 3 && (
        <Card>
          <CardTitle>
            Knowledge Base Activated
            <FeatureTag>Step 3</FeatureTag>
          </CardTitle>
          
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(75, 86, 210, 0.2), rgba(95, 75, 210, 0.1))', 
            padding: '30px 20px',
            borderRadius: '10px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🎉</div>
            <h2 style={{ margin: '0 0 15px' }}>Your AI Knowledge Base is Ready!</h2>
            <p style={{ fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 20px' }}>
              Your content is now searchable using powerful AI that understands the meaning behind questions, 
              not just keywords.
            </p>
            
            <Button 
              style={{ 
                margin: '0 auto',
                background: 'linear-gradient(135deg, #4466ff, #884DFF)', 
                padding: '14px 28px',
                fontSize: '1.1rem'
              }}
              onClick={() => {
                // Navigate to the search collection page
                window.location.href = '/pages/SearchCollection';
              }}
            >
              Start Using AI Search
            </Button>
          </div>
          
          <TwoColumnGrid>
            <div>
              <h3>What happens next?</h3>
              <ul>
                <li>Your content is now searchable using natural language queries</li>
                <li>Users can ask questions in everyday language</li>
                <li>The system finds relevant information even when exact keywords aren't used</li>
                <li>Results are ranked by relevance to the query</li>
                <li>Add more content anytime to expand your knowledge base</li>
              </ul>
            </div>
            <div>
              <h3>Sample queries to try:</h3>
              <ul>
                <li>"What's our refund policy for damaged items?"</li>
                <li>"How do I reset my password?"</li>
                <li>"What are the steps to configure the API?"</li>
                <li>"Tell me about our employee health benefits"</li>
                <li>"What's the procedure for requesting time off?"</li>
              </ul>
            </div>
          </TwoColumnGrid>
        </Card>
      )}
      
      {/* Success Modal */}
      <SuccessModal 
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        count={modalData.count}
        collection={modalData.collection}
      />
    </PageContainer>
  )
}

export default IndexDocuments