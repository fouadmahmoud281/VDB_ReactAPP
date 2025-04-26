import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../../theme';

// Import the new enhanced Header
import Header from './Header';
import StatusCard from '../ui/StatusCard';
import LoadingSpinner from '../ui/LoadingSpinner';

// Lazy loaded page components for code splitting and improved performance
const CreateEmbeddings = lazy(() => import('../pages/CreateEmbeddings'));
const IndexDocuments = lazy(() => import('../pages/IndexDocuments'));
const SearchCollection = lazy(() => import('../pages/SearchCollection'));

// Dashboard Container with improved theme variables and responsiveness
const DashboardContainer = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: clamp(20px, 4vw, 40px);
  background: var(--bg-gradient, linear-gradient(135deg, ${THEME.backgroundColor} 0%, #1a1d2b 100%));
  min-height: 100vh;
  position: relative;
  color: ${THEME.textColor};
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  
  /* Modern scrollbar */
  scrollbar-width: thin;
  scrollbar-color: ${THEME.primaryColor} ${THEME.secondaryBgColor};
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${THEME.secondaryBgColor};
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${THEME.primaryColor};
    border-radius: 20px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const StatusContainer = styled(motion.section)`
  background-color: ${THEME.secondaryBgColor};
  border-radius: 12px;
  padding: clamp(15px, 2vw, 24px);
  margin-bottom: clamp(20px, 2.5vw, 30px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, ${THEME.primaryColor}, transparent);
  }
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const StatusTitle = styled.h2`
  margin-top: 0;
  margin-bottom: clamp(15px, 2vw, 20px);
  font-weight: 600;
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  display: flex;
  align-items: center;
  color: ${THEME.headingColor || THEME.textColor};
  position: relative;
  
  &::before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    background-color: #4CAF50;
    border-radius: 50%;
    margin-right: 12px;
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
    }
    70% {
      box-shadow: 0 0 0 8px rgba(76, 175, 80, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
    }
  }
`;

const StatusRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: clamp(12px, 1.5vw, 20px);
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ContentContainer = styled(motion.main)`
  margin-top: clamp(20px, 2.5vw, 30px);
  background-color: ${THEME.secondaryBgColor};
  border-radius: 12px;
  padding: clamp(15px, 2.5vw, 30px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-height: 400px;
  position: relative;
  overflow: hidden;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 40%;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${THEME.primaryColor}80);
  }
`;

const LoadingScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${THEME.backgroundColor};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  
  & > p {
    margin-top: 20px;
    font-size: 1.1rem;
    opacity: 0.7;
  }
`;

const LoadingFallback = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 300px;
  width: 100%;
  flex-direction: column;
  
  & > p {
    margin-top: 15px;
    opacity: 0.7;
  }
`;

const SystemStatusBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${THEME.backgroundColor};
  padding: 6px 16px;
  font-size: 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 100;
  opacity: 0.8;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SystemStatus = styled.span<{ online?: boolean }>`
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    background-color: ${props => props.online ? '#4CAF50' : '#F44336'};
  }
`;

const ErrorBoundary = styled.div`
  padding: 30px;
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid #F44336;
  border-radius: 8px;
  
  & h3 {
    color: #F44336;
    margin-top: 0;
  }
  
  & button {
    background-color: #F44336;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
    
    &:hover {
      background-color: #D32F2F;
    }
  }
`;

// Custom Navigation Component - Inline to ensure it works properly
const NavContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  width: 100%;
  margin: 0 0 24px 0;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

interface NavCardProps {
  active: boolean;
  disabled?: boolean;
}

const NavCard = styled.div<NavCardProps>`
  background-color: ${props => 
    props.disabled ? 'rgba(30, 30, 40, 0.3)' : 
    props.active ? THEME.primaryColor : '#1e2029'
  };
  border-radius: 10px;
  flex: 1;
  min-width: 180px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid ${props => 
    props.active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'
  };
  box-shadow: ${props => 
    props.active ? '0 4px 15px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
  };
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-3px)'};
    box-shadow: ${props => 
      props.disabled ? '0 2px 8px rgba(0, 0, 0, 0.1)' : '0 6px 18px rgba(0, 0, 0, 0.15)'
    };
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
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }
`;

const CardIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  padding: 0;
`;

const CardDescription = styled.p`
  font-size: 13px;
  margin: 0;
  padding: 0;
  opacity: 0.7;
  line-height: 1.4;
`;

// SVG Icon components
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

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

interface TabData {
  key: string;
  title: string;
  description: string;
  component: JSX.Element;
  icon: string;
}

const Dashboard: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [systemInfo, setSystemInfo] = useState({
    apiVersion: 'v1.3.0',
    lastUpdated: new Date().toLocaleString(),
    collectionCount: 12
  });
  
  // Define our tab components with metadata
  const tabs: TabData[] = useMemo(() => [
    {
      key: "create",
      title: "Create Embeddings",
      description: "Convert text to vector embeddings for semantic search",
      component: (
        <Suspense fallback={<LoadingFallback><LoadingSpinner size={40} />
          <p>Loading embeddings module...</p></LoadingFallback>}>
          <CreateEmbeddings />
        </Suspense>
      ),
      icon: "create"
    },
    {
      key: "index",
      title: "Index Documents",
      description: "Add documents to your searchable collection",
      component: (
        <Suspense fallback={<LoadingFallback><LoadingSpinner size={40} />
          <p>Loading indexing module...</p></LoadingFallback>}>
          <IndexDocuments />
        </Suspense>
      ),
      icon: "index"
    },
    {
      key: "search",
      title: "Search Collection",
      description: "Find similar documents using semantic search",
      component: (
        <Suspense fallback={<LoadingFallback><LoadingSpinner size={40} />
          <p>Loading search module...</p></LoadingFallback>}>
          <SearchCollection />
        </Suspense>
      ),
      icon: "search"
    }
  ], []);
  
  // Simulate initial loading and system status check
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    // Simulate API call to get system status
    const fetchSystemStatus = async () => {
      try {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // In a real app, this would fetch actual data
        setSystemInfo({
          apiVersion: 'v1.3.0',
          lastUpdated: new Date().toLocaleString(),
          collectionCount: Math.floor(Math.random() * 10) + 10
        });
      } catch (err) {
        console.error("Failed to fetch system status", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      }
    };
    
    fetchSystemStatus();
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle tab change
  const handleTabChange = (index: number) => {
    setActiveTab(index);
    
    // Save user preference
    try {
      localStorage.setItem('vectorDB_lastTab', index.toString());
    } catch (e) {
      // Ignore storage errors
    }
  };
  
  // Load saved tab preference on startup
  useEffect(() => {
    try {
      const savedTab = localStorage.getItem('vectorDB_lastTab');
      if (savedTab !== null) {
        const tabIndex = parseInt(savedTab);
        if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < tabs.length) {
          setActiveTab(tabIndex);
        }
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, [tabs.length]);
  
  // Handle error retry
  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };
  
  // Custom Icon component based on icon type
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
  
  if (isLoading) {
    return (
      <LoadingScreen>
        <LoadingSpinner size={60} />
        <p>Initializing Vector Database Explorer...</p>
      </LoadingScreen>
    );
  }
  
  if (error) {
    return (
      <DashboardContainer>
        <ContentWrapper>
          <ErrorBoundary>
            <h3>Something went wrong</h3>
            <p>{error.message || "An unknown error occurred"}</p>
            <button onClick={handleRetry}>Retry</button>
          </ErrorBoundary>
        </ContentWrapper>
      </DashboardContainer>
    );
  }
  
  return (
    <DashboardContainer>
      <ContentWrapper>
        {/* Using the new enhanced Header component */}
        <Header className="main-header" />
        
        <StatusContainer
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <StatusTitle>System Status</StatusTitle>
          <StatusRow>
            <motion.div variants={itemVariants}>
              <StatusCard 
                label="Embedding Engine" 
                status="online" 
                statusText="Online"
                value={systemInfo.apiVersion}
                icon="memory"
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <StatusCard 
                label="Vector Database" 
                status="online" 
                statusText="Connected"
                value={`${systemInfo.collectionCount} collections`}
                icon="storage"
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <StatusCard 
                label="API Status" 
                status="online" 
                statusText="Operational"
                value="30ms latency"
                icon="cloud_done"
              />
            </motion.div>
          </StatusRow>
        </StatusContainer>
        
        {/* Custom Navigation - now inline */}
        <NavContainer role="tablist" aria-label="Main navigation">
          {tabs.map((tab, index) => (
            <NavCard 
              key={index} 
              active={activeTab === index}
            >
              <CardButton
                onClick={() => handleTabChange(index)}
                role="tab"
                aria-selected={activeTab === index}
                aria-controls={`tab-panel-${index}`}
                id={`tab-${index}`}
                tabIndex={activeTab === index ? 0 : -1}
                aria-label={tab.description || tab.title}
                title={tab.description || tab.title}
              >
                <CardContent>
                  <CardHeader>
                    <IconContainer aria-hidden="true">
                      <CustomIcon icon={tab.icon} />
                    </IconContainer>
                    {activeTab === index && <CardIndicator />}
                  </CardHeader>
                  <div>
                    <CardTitle>{tab.title}</CardTitle>
                    <CardDescription>{tab.description}</CardDescription>
                  </div>
                </CardContent>
              </CardButton>
            </NavCard>
          ))}
        </NavContainer>
        
        <ContentContainer
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
            >
              {tabs[activeTab].component}
            </motion.div>
          </AnimatePresence>
        </ContentContainer>
      </ContentWrapper>
      
      <SystemStatusBar>
        <SystemStatus online={true}>System online</SystemStatus>
        <span>Last updated: {systemInfo.lastUpdated}</span>
      </SystemStatusBar>
    </DashboardContainer>
  );
};

export default Dashboard;