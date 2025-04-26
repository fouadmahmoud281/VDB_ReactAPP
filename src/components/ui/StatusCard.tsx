import styled from '@emotion/styled'
import { THEME } from '../../theme'

const StatusCardContainer = styled.div`
  background-color: ${THEME.secondaryBgColor};
  border-radius: 10px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
`

const StatusIndicator = styled.div<{ status: 'online' | 'offline' | 'warning' }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.status) {
      case 'online': return THEME.successColor;
      case 'offline': return THEME.errorColor;
      case 'warning': return THEME.warningColor;
      default: return THEME.successColor;
    }
  }};
  box-shadow: 0 0 5px ${props => {
    switch (props.status) {
      case 'online': return THEME.successColor;
      case 'offline': return THEME.errorColor;
      case 'warning': return THEME.warningColor;
      default: return THEME.successColor;
    }
  }};
`

const StatusContent = styled.div`
  flex: 1;
`

const StatusLabel = styled.div`
  opacity: 0.7;
  font-size: 0.8rem;
`

const StatusValue = styled.div<{ status: 'online' | 'offline' | 'warning' }>`
  font-weight: 500;
  color: ${props => {
    switch (props.status) {
      case 'online': return THEME.successColor;
      case 'offline': return THEME.errorColor;
      case 'warning': return THEME.warningColor;
      default: return THEME.successColor;
    }
  }};
`

interface StatusCardProps {
  label: string;
  status: 'online' | 'offline' | 'warning';
  statusText?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  label, 
  status, 
  statusText = status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Warning'
}) => {
  return (
    <StatusCardContainer>
      <StatusIndicator status={status} />
      <StatusContent>
        <StatusLabel>{label}</StatusLabel>
        <StatusValue status={status}>{statusText}</StatusValue>
      </StatusContent>
    </StatusCardContainer>
  )
}

export default StatusCard