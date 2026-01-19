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
  padding: 0.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.borderSubtle};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const Icon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${({ theme }) => theme.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`;

const Details = styled.div`
  flex: 1;
  min-width: 0;
`;

const Source = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SourceUrl = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Stats = styled.div`
  text-align: right;
`;

const Count = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
`;

const Percent = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textMuted};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.9rem;
`;

// Referrer icons based on domain
const referrerIcons: Record<string, string> = {
  'Direct': '🎯',
  'google.com': '🔍',
  'facebook.com': '📘',
  'twitter.com': '🐦',
  'x.com': '𝕏',
  'instagram.com': '📸',
  'linkedin.com': '💼',
  'youtube.com': '▶️',
  'reddit.com': '🤖',
  'tiktok.com': '🎵',
  'pinterest.com': '📌',
  'telegram.org': '✈️',
  'discord.com': '💬',
  'github.com': '🐙',
  't.co': '🐦',
};

const getIconForReferrer = (domain: string): string => {
  if (referrerIcons[domain]) {
    return referrerIcons[domain];
  }
  // Check for partial matches
  for (const [key, icon] of Object.entries(referrerIcons)) {
    if (domain.includes(key) || key.includes(domain)) {
      return icon;
    }
  }
  return '🔗';
};

const getDisplayName = (domain: string): string => {
  const names: Record<string, string> = {
    'Direct': 'Direct / None',
    'google.com': 'Google',
    'facebook.com': 'Facebook',
    'twitter.com': 'Twitter',
    'x.com': 'X (Twitter)',
    'instagram.com': 'Instagram',
    'linkedin.com': 'LinkedIn',
    'youtube.com': 'YouTube',
    'reddit.com': 'Reddit',
    'tiktok.com': 'TikTok',
    'pinterest.com': 'Pinterest',
    'telegram.org': 'Telegram',
    'discord.com': 'Discord',
    'github.com': 'GitHub',
    't.co': 'Twitter',
  };

  if (names[domain]) {
    return names[domain];
  }

  // Capitalize first letter and remove common prefixes
  const cleaned = domain.replace(/^(www\.|m\.)/, '');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

interface ReferrerData {
  value: string;
  count: number;
}

interface ReferrerListProps {
  title?: string;
  subtitle?: string;
  data: ReferrerData[];
  maxItems?: number;
}

export const ReferrerList: React.FC<ReferrerListProps> = ({
  title = 'Top Referrers',
  subtitle,
  data,
  maxItems = 5,
}) => {
  const displayData = data.slice(0, maxItems);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

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

      {displayData.length === 0 ? (
        <EmptyState>No referrer data yet</EmptyState>
      ) : (
        <List>
          {displayData.map((item) => (
            <Item key={item.value}>
              <Icon>{getIconForReferrer(item.value)}</Icon>
              <Details>
                <Source>{getDisplayName(item.value)}</Source>
                {item.value !== 'Direct' && <SourceUrl>{item.value}</SourceUrl>}
              </Details>
              <Stats>
                <Count>{item.count.toLocaleString()}</Count>
                <Percent>{getPercent(item.count)}</Percent>
              </Stats>
            </Item>
          ))}
        </List>
      )}
    </Container>
  );
};

export default ReferrerList;
