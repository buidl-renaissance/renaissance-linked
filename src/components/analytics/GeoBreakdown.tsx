import React from 'react';
import styled, { useTheme } from 'styled-components';

const Container = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.5rem;
`;

const Header = styled.div`
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0.25rem 0 0;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Rank = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textMuted};
  width: 1.5rem;
  text-align: right;
`;

const BarContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const Count = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
`;

const BarBackground = styled.div`
  height: 6px;
  background: ${({ theme }) => theme.backgroundAlt};
  border-radius: 3px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ $color }) => $color};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.9rem;
`;

// Country emoji flags (subset of common countries)
const countryFlags: Record<string, string> = {
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Japan': '🇯🇵',
  'South Korea': '🇰🇷',
  'Brazil': '🇧🇷',
  'India': '🇮🇳',
  'Mexico': '🇲🇽',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'Netherlands': '🇳🇱',
  'Sweden': '🇸🇪',
  'Switzerland': '🇨🇭',
  'China': '🇨🇳',
  'Singapore': '🇸🇬',
  'Unknown': '🌍',
};

interface GeoData {
  value: string;
  count: number;
}

interface GeoBreakdownProps {
  title?: string;
  subtitle?: string;
  data: GeoData[];
  maxItems?: number;
}

export const GeoBreakdown: React.FC<GeoBreakdownProps> = ({
  title = 'Top Countries',
  subtitle,
  data,
  maxItems = 5,
}) => {
  const theme = useTheme();
  const displayData = data.slice(0, maxItems);
  const maxCount = displayData.length > 0 ? displayData[0].count : 0;

  const getFlag = (country: string) => {
    return countryFlags[country] || '🌍';
  };

  return (
    <Container>
      <Header>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </Header>

      {displayData.length === 0 ? (
        <EmptyState>No geographic data yet</EmptyState>
      ) : (
        <List>
          {displayData.map((item, index) => (
            <Item key={item.value}>
              <Rank>{index + 1}</Rank>
              <BarContainer>
                <LabelRow>
                  <Label>
                    {getFlag(item.value)} {item.value}
                  </Label>
                  <Count>{item.count.toLocaleString()}</Count>
                </LabelRow>
                <BarBackground>
                  <BarFill
                    $width={maxCount > 0 ? (item.count / maxCount) * 100 : 0}
                    $color={theme.accent}
                  />
                </BarBackground>
              </BarContainer>
            </Item>
          ))}
        </List>
      )}
    </Container>
  );
};

export default GeoBreakdown;
