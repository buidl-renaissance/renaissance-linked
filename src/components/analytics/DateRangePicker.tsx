import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const RangeButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  ${({ theme, $active }) =>
    $active
      ? `
        background: ${theme.accent};
        border: 1px solid ${theme.accent};
        color: ${theme.signalWhite};
      `
      : `
        background: ${theme.surface};
        border: 1px solid ${theme.border};
        color: ${theme.textMuted};

        &:hover {
          border-color: ${theme.accent};
          color: ${theme.text};
        }
      `}
`;

export type DateRangeOption = '7d' | '30d' | '90d';

interface DateRangePickerProps {
  value: DateRangeOption;
  onChange: (range: DateRangeOption) => void;
}

const rangeLabels: Record<DateRangeOption, string> = {
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
}) => {
  return (
    <Container>
      {(Object.keys(rangeLabels) as DateRangeOption[]).map((range) => (
        <RangeButton
          key={range}
          $active={value === range}
          onClick={() => onChange(range)}
        >
          {rangeLabels[range]}
        </RangeButton>
      ))}
    </Container>
  );
};

export default DateRangePicker;
