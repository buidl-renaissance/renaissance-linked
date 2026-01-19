import React from 'react';
import styled, { useTheme } from 'styled-components';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ChartContainer = styled.div`
  width: 120px;
  height: 120px;
  flex-shrink: 0;
`;

const Legend = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LegendDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const LegendLabel = styled.span`
  flex: 1;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text};
`;

const LegendValue = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textMuted};
`;

const LegendPercent = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textMuted};
  min-width: 40px;
  text-align: right;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.9rem;
`;

const TooltipContainer = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text};
`;

// Device type icons
const deviceIcons: Record<string, string> = {
  desktop: '💻',
  mobile: '📱',
  tablet: '📟',
  unknown: '❓',
};

// Browser icons
const browserIcons: Record<string, string> = {
  Chrome: '🌐',
  Safari: '🧭',
  Firefox: '🦊',
  Edge: '🔷',
  Opera: '⭕',
  Unknown: '🌐',
};

interface DeviceData {
  value: string;
  count: number;
}

interface DeviceStatsProps {
  title?: string;
  subtitle?: string;
  data: DeviceData[];
  type?: 'device' | 'browser';
}

// Color palette for pie chart
const COLORS = ['#7B5CFF', '#22C55E', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'];

export const DeviceStats: React.FC<DeviceStatsProps> = ({
  title = 'Devices',
  subtitle,
  data,
  type = 'device',
}) => {
  const theme = useTheme();
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  const chartData = data.map((item, index) => ({
    name: item.value,
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  const getIcon = (value: string) => {
    if (type === 'device') {
      return deviceIcons[value.toLowerCase()] || deviceIcons.unknown;
    }
    return browserIcons[value] || browserIcons.Unknown;
  };

  const getPercent = (count: number) => {
    if (totalCount === 0) return '0%';
    return `${Math.round((count / totalCount) * 100)}%`;
  };

  return (
    <Container>
      <Header>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </Header>

      {data.length === 0 ? (
        <EmptyState>No {type} data yet</EmptyState>
      ) : (
        <Content>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const item = payload[0].payload;
                    return (
                      <TooltipContainer>
                        {item.name}: {item.value.toLocaleString()} ({getPercent(item.value)})
                      </TooltipContainer>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <Legend>
            {chartData.map((item) => (
              <LegendItem key={item.name}>
                <LegendDot $color={item.color} />
                <LegendLabel>
                  {getIcon(item.name)} {item.name}
                </LegendLabel>
                <LegendValue>{item.value.toLocaleString()}</LegendValue>
                <LegendPercent>{getPercent(item.value)}</LegendPercent>
              </LegendItem>
            ))}
          </Legend>
        </Content>
      )}
    </Container>
  );
};

export default DeviceStats;
