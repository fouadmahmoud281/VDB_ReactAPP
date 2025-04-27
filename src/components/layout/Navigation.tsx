import React, { useRef, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../../theme';

// Cards-based navigation container with improved layout
const NavContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  width: 100%;
  margin: 0 0 28px 0;
  position: relative;
  z-index: 2;
  
  @media (max-width: 992px) {
    gap: 12px;
  }
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 14px;
  }
`;

interface NavCardProps {
  active: boolean;
  disabled?: boolean;
}

// Card-style navigation item with improved transitions
const NavCard = styled(motion.div)<NavCardProps>`
  background-color: ${props => 
    props.disabled ? 'rgba(30, 30, 40, 0.3)' : 
    props.active ? THEME.primaryColor : '#1e2029'
  };
  border-radius: 12px;
  flex: 1;
  min-width: 200px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  position: relative;
  overflow: hidden;
  border: 1px solid ${props => 
    props.active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'
  };
  box-shadow: ${props => 
    props.active ? '0 6px 18px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
  };
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${props => props.active ? 'linear-gradient(90deg, rgba(255,255,255,0.4), transparent)' : 'transparent'};
    opacity: ${props => props.active ? 1 : 0};
    transition: opacity 0.3s ease;
  }
  
  @media (max-width: 992px) {
    min-width: 180px;
  }
  
  @media (max-width: 768px) {
    min-width: 150px;
  }
  
  @media (max-width: 480px) {
    min-width: 0;
    flex: 1 0 100%;
  }
`;

const CardButton = styled.button`
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  color: white;
  padding: 0;
  margin: 0;
  text-align: left;
  cursor: inherit;
  display: block;
  outline: none;
  
  &:focus-visible {
    box-shadow: 0 0 0 2px white, 0 0 0 4px ${THEME.primaryColor};
  }
`;

const CardContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  @media (max-width: 768px) {
    padding: 16px;
    gap: 14px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const IconContainer = styled.div<{ active: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: ${props => props.active 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    transition: transform 0.3s ease;
  }
  
  @media (max-width: 768px) {
    width: 38px;
    height: 38px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const CardIndicator = styled(motion.div)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

const CardTitle = styled.h3`
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  padding: 0;
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const CardDescription = styled.p`
  font-size: 14px;
  margin: 8px 0 0 0;
  padding: 0;
  opacity: 0.8;
  line-height: 1.5;
  transition: opacity 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin-top: 6px;
  }
`;

// Badge component for "new" or other indicators
const Badge = styled(motion.span)`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: ${THEME.accentColor || '#ff7b45'};
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

// Enhanced SVG Icon components with hover effects
const CreateEmbeddingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IndexDocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10h8M8 14h8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 16l4 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Icon mapping based on the type
const CustomIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'create':
      return <CreateEmbeddingIcon />;
    case 'index':
      return <IndexDocumentIcon />;
    case 'search':
      return <SearchIcon />;
    default:
      return null;
  }
};

interface TabData {
  name: string;
  icon: string;
  disabled?: boolean;
  description?: string;
  badge?: string;
  new?: boolean;
}

interface NavigationProps {
  activeTab: number;
  onTabChange: (index: number) => void;
  tabs?: TabData[];
  className?: string;
  ariaLabel?: string;
}

// Animation variants
const cardVariants = {
  inactive: {
    scale: 1
  },
  active: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  hover: {
    y: -6,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  },
  disabled: {
    scale: 0.98,
    opacity: 0.6
  }
};

const badgeVariants = {
  initial: { scale: 0 },
  animate: { 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 10,
      delay: 0.3
    }
  }
};

const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  className,
  ariaLabel = "Navigation options",
  tabs = [
    { 
      name: 'Create Embeddings', 
      icon: 'create', 
      description: 'Convert text to vector embeddings for semantic search' 
    },
    { 
      name: 'Index Documents', 
      icon: 'index', 
      description: 'Add documents to your searchable collection' 
    },
    { 
      name: 'Search Collection', 
      icon: 'search', 
      description: 'Find similar documents using semantic search' 
    }
  ]
}) => {
  // Track whether tabs have been rendered for animations
  const [isRendered, setIsRendered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set rendered state for animations after initial mount
  useEffect(() => {
    setIsRendered(true);
  }, []);
  
  // Cleanup function for each tab
  const onTabFocus = (index: number) => {
    // If we're not on the active tab already, change to it
    if (activeTab !== index) {
      onTabChange(index);
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTabChange(index);
    }
    
    // Arrow key navigation
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      onTabChange(nextIndex);
      // Focus the next tab button
      const nextTab = document.getElementById(`tab-${nextIndex}`);
      nextTab?.focus();
    }
    
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      onTabChange(prevIndex);
      // Focus the previous tab button
      const prevTab = document.getElementById(`tab-${prevIndex}`);
      prevTab?.focus();
    }
  };
  
  return (
    <NavContainer 
      className={className} 
      role="tablist" 
      aria-label={ariaLabel}
      ref={containerRef}
    >
      {tabs.map((tab, index) => (
          <NavCard 
            key={index} 
            active={activeTab === index}
            disabled={tab.disabled}
            initial="inactive"
            animate={tab.disabled ? "disabled" : activeTab === index ? "active" : "inactive"}
            {...(!tab.disabled && { whileHover: "hover" })}
            variants={cardVariants}
            layout
            transition={{
              layout: { type: "spring", stiffness: 300, damping: 30 }
            }}
            style={{
              // Stagger entrance of cards
              opacity: isRendered ? 1 : 0,
              transform: isRendered ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`
            }}
          >
          <CardButton
            onClick={() => !tab.disabled && onTabChange(index)}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tab-panel-${index}`}
            id={`tab-${index}`}
            tabIndex={activeTab === index ? 0 : -1}
            aria-label={tab.description || tab.name}
            title={tab.description || tab.name}
            disabled={tab.disabled}
            onFocus={() => onTabFocus(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <CardContent>
              <CardHeader>
                <IconContainer active={activeTab === index} aria-hidden="true">
                  <CustomIcon icon={tab.icon} />
                </IconContainer>
                {activeTab === index && (
                  <AnimatePresence>
                    <CardIndicator
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  </AnimatePresence>
                )}
              </CardHeader>
              <div>
                <CardTitle>{tab.name}</CardTitle>
                <CardDescription>{tab.description}</CardDescription>
              </div>
            </CardContent>
          </CardButton>
          
          {/* Badge for "new" features or other indicators */}
          {(tab.badge || tab.new) && (
            <Badge
              variants={badgeVariants}
              initial="initial"
              animate="animate"
              aria-hidden="true"
            >
              {tab.badge || "New"}
            </Badge>
          )}
        </NavCard>
      ))}
    </NavContainer>
  );
};

export default Navigation;