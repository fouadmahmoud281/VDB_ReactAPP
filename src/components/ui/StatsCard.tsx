import styled from '@emotion/styled';
import { THEME } from '../../theme';

const StatsCardContainer = styled.div`
  background-color: ${THEME.secondaryBgColor};
  border-radius: 10px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
`;

const ValueContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
`;

const Value = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
`;

interface DeltaProps {
  color: 'green' | 'red' | 'gray';
}

const Delta = styled.span<DeltaProps>`
  color: ${props => {
    switch (props.color) {
      case 'green': return THEME.successColor;
      case 'red': return THEME.errorColor;
      default: return 'gray';
    }
  }};
  font-size: 0.9rem;
  margin-left: 5px;
`;

const Description = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 5px;
`;

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  delta?: string | number;
  deltaColor?: 'normal' | 'inverse';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  delta,
  deltaColor = 'normal'
}) => {
  const getDeltaSymbol = () => {
    if (!delta) return '';
    const numDelta = typeof delta === 'string' ? parseFloat(delta) : delta;
    return numDelta > 0 ? '▲' : numDelta < 0 ? '▼' : '◆';
  };

  const getDeltaColor = (): 'green' | 'red' | 'gray' => {
    if (!delta) return 'gray';
    const numDelta = typeof delta === 'string' ? parseFloat(delta) : delta;
    if (numDelta === 0) return 'gray';
    return (numDelta > 0 && deltaColor === 'normal') || (numDelta < 0 && deltaColor === 'inverse')
      ? 'green'
      : 'red';
  };

  return (
    <StatsCardContainer>
      <Title>{title}</Title>
      <ValueContainer>
        <Value>{value}</Value>
        {delta && (
          <Delta color={getDeltaColor()}>
            {getDeltaSymbol()} {delta}
          </Delta>
        )}
      </ValueContainer>
      {description && <Description>{description}</Description>}
    </StatsCardContainer>
  );
};

export default StatsCard;