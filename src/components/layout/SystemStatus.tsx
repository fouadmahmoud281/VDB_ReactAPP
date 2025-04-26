import styled from '@emotion/styled';
import { THEME } from '../../theme';

const StatusContainer = styled.div`
  background-color: ${THEME.secondaryBgColor};
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const StatusTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 15px;
  opacity: 0.7;
`;

const StatusRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 15px;
`;

interface StatusItemProps {
  status: 'online' | 'offline' | 'warning';
}

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
  background-color: #262b36;
  padding: 12px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const StatusIndicator = styled.div<StatusItemProps>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 12px;
  background-color: ${props => {
    switch (props.status) {
      case 'online': return THEME.successColor;
      case 'offline': return THEME.errorColor;
      case 'warning': return THEME.warningColor;
    }
  }};
  box-shadow: 0 0 5px ${props => {
    switch (props.status) {
      case 'online': return THEME.successColor;
      case 'offline': return THEME.errorColor;
      case 'warning': return THEME.warningColor;
    }
  }};
`;

const StatusContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatusLabel = styled.div`
  opacity: 0.7;
  font-size: 0.8rem;
`;

interface StatusTextProps {
  status: 'online' | 'offline' | 'warning';
}

const StatusText = styled.div<StatusTextProps>`
  font-weight: 500;
  color: ${props => {
    switch (props.status) {
      case 'online': return THEME.successColor;
      case 'offline': return THEME.errorColor;
      case 'warning': return THEME.warningColor;
    }
  }};
`;

interface StatusItemData {
  label: string;
  status: 'online' | 'offline' | 'warning';
  text: string;
}

interface SystemStatusProps {
  items?: StatusItemData[];
}

const SystemStatus: React.FC<SystemStatusProps> = ({ 
  items = [
    { label: 'Embedding Engine', status: 'online', text: 'Online' },
    { label: 'Vector Database', status: 'online', text: 'Connected' },
    { label: 'API Status', status: 'online', text: 'Operational' }
  ] 
}) => {
  return (
    <StatusContainer>
      <StatusTitle>System Status</StatusTitle>
      <StatusRow>
        {items.map((item, index) => (
          <StatusItem key={index}>
            <StatusIndicator status={item.status} />
            <StatusContent>
              <StatusLabel>{item.label}</StatusLabel>
              <StatusText status={item.status}>{item.text}</StatusText>
            </StatusContent>
          </StatusItem>
        ))}
      </StatusRow>
    </StatusContainer>
  );
};

export default SystemStatus;