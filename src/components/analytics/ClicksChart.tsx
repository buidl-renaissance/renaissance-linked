import React from 'react';
import styled, { useTheme } from 'styled-components';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { format, parseISO } from 'date-fns';

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.5rem;
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ChartTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const ChartSubtitle = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0.25rem 0 0;
`;

const Legend = styled.div`
  display: flex;
  gap: 1rem;
`;

const LegendItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textMuted};

  &::before {
    content: '';
    width: 12px;
    height: 3px;
    background: ${({ $color }) => $color};
    border-radius: 2px;
  }
`;

const TooltipContainer = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 12px ${({ theme }) => theme.shadow};
`;

const TooltipDate = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0 0 0.5rem;
`;

const TooltipValue = styled.p<{ $color: string }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $color }) => $color};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: ${({ $color }) => $color};
    border-radius: 50%;
  }
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.9rem;
`;

interface DataPoint {
  date: string;
  count: number;
}

interface ClicksChartProps {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  secondaryData?: DataPoint[];
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: string;
  primaryLabel: string;
  secondaryLabel?: string;
  primaryColor: string;
  secondaryColor?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  primaryLabel,
  secondaryLabel,
  primaryColor,
  secondaryColor,
}) => {
  if (!active || !payload || !label) return null;

  const formattedDate = format(parseISO(label), 'MMM d, yyyy');

  return (
    <TooltipContainer>
      <TooltipDate>{formattedDate}</TooltipDate>
      {payload.map((item, index) => (
        <TooltipValue
          key={item.dataKey}
          $color={index === 0 ? primaryColor : (secondaryColor || primaryColor)}
        >
          {item.value} {index === 0 ? primaryLabel : secondaryLabel}
        </TooltipValue>
      ))}
    </TooltipContainer>
  );
};

export const ClicksChart: React.FC<ClicksChartProps> = ({
  title,
  subtitle,
  data,
  secondaryData,
  primaryLabel = 'clicks',
  secondaryLabel = 'views',
  primaryColor,
  secondaryColor,
}) => {
  const theme = useTheme();
  const pColor = primaryColor || theme.accent;
  const sColor = secondaryColor || theme.success;

  // Merge data if secondary data exists
  const chartData = data.map((item) => {
    const secondary = secondaryData?.find((s) => s.date === item.date);
    return {
      date: item.date,
      primary: item.count,
      secondary: secondary?.count || 0,
    };
  });

  const hasData = chartData.some((d) => d.primary > 0 || d.secondary > 0);

  return (
    <ChartContainer>
      <ChartHeader>
        <div>
          <ChartTitle>{title}</ChartTitle>
          {subtitle && <ChartSubtitle>{subtitle}</ChartSubtitle>}
        </div>
        <Legend>
          <LegendItem $color={pColor}>{primaryLabel}</LegendItem>
          {secondaryData && (
            <LegendItem $color={sColor}>{secondaryLabel}</LegendItem>
          )}
        </Legend>
      </ChartHeader>

      {!hasData ? (
        <NoDataMessage>No data for this period</NoDataMessage>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={pColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={pColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="secondaryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={sColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={sColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.border}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: theme.textMuted, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: theme.border }}
              tickFormatter={(value) => format(parseISO(value), 'MMM d')}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: theme.textMuted, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={
                <CustomTooltip
                  primaryLabel={primaryLabel}
                  secondaryLabel={secondaryLabel}
                  primaryColor={pColor}
                  secondaryColor={sColor}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="primary"
              stroke={pColor}
              strokeWidth={2}
              fill="url(#primaryGradient)"
              dot={false}
              activeDot={{ r: 4, fill: pColor }}
            />
            {secondaryData && (
              <Area
                type="monotone"
                dataKey="secondary"
                stroke={sColor}
                strokeWidth={2}
                fill="url(#secondaryGradient)"
                dot={false}
                activeDot={{ r: 4, fill: sColor }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default ClicksChart;
