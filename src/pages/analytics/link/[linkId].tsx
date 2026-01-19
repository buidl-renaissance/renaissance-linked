import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/router';
import { useUser } from '@/contexts/UserContext';
import { Loading } from '@/components/Loading';
import {
  DateRangePicker,
  DateRangeOption,
  ClicksChart,
  GeoBreakdown,
  DeviceStats,
  ReferrerList,
} from '@/components/analytics';

const APP_NAME = 'Linked';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
`;

const Header = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const HeaderTitle = styled.h1`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const HeaderSpacer = styled.div`
  height: 60px;
`;

const ContentArea = styled.div`
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 1rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const TitleSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const PageTitle = styled.h1`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PageSubtitle = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.accent};
  margin: 0.25rem 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textMuted};
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const BreakdownGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LinkPreviewCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
  }
`;

const LinkImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  background: ${({ theme }) => theme.backgroundAlt};
`;

const LinkPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: ${({ theme }) => theme.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: ${({ theme }) => theme.textMuted};
`;

const LinkDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const LinkTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem;
`;

const LinkUrl = styled.a`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.accent};
  text-decoration: none;
  word-break: break-all;

  &:hover {
    text-decoration: underline;
  }
`;

const VisitButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.accent};
  color: white;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.accentHover};
  }
`;

interface LinkAnalytics {
  linkId: string;
  linkTitle: string | null;
  linkUrl: string;
  totalClicks: number;
  clicksOverTime: { date: string; count: number }[];
  byCountry: { value: string; count: number }[];
  byDevice: { value: string; count: number }[];
  byBrowser: { value: string; count: number }[];
  byReferrer: { value: string; count: number }[];
}

const LinkAnalyticsPage: React.FC = () => {
  const router = useRouter();
  const { linkId } = router.query;
  const { user, isLoading: isUserLoading } = useUser();
  const [dateRange, setDateRange] = useState<DateRangeOption>('30d');
  const [analytics, setAnalytics] = useState<LinkAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!linkId || typeof linkId !== 'string') return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/clicks/${linkId}?range=${dateRange}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/app');
          return;
        }
        if (response.status === 404) {
          setError('Link not found');
          return;
        }
        if (response.status === 403) {
          setError('You do not have access to this link');
          return;
        }
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching link analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [linkId, dateRange, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/app');
    }
  }, [isUserLoading, user, router]);

  // Fetch analytics when ready
  useEffect(() => {
    if (user && linkId) {
      fetchAnalytics();
    }
  }, [user, linkId, fetchAnalytics]);

  const handleBack = () => {
    router.push('/dashboard');
  };

  // Loading state
  if (isUserLoading || !user) {
    return <Loading text="Loading..." />;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <Container>
      <Head>
        <title>{`Link Analytics | ${APP_NAME}`}</title>
        <meta name="description" content={`Analytics for your link on ${APP_NAME}`} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Main>
        <Header>
          <BackButton onClick={handleBack}>
            ← Dashboard
          </BackButton>
          <HeaderTitle>Link Analytics</HeaderTitle>
          <div style={{ width: 80 }} />
        </Header>

        <HeaderSpacer />

        <ContentArea>
          {isLoading ? (
            <Loading text="Loading analytics..." />
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#EF4444' }}>
              {error}
            </div>
          ) : analytics ? (
            <>
              {/* Link Preview */}
              <LinkPreviewCard>
                <LinkPlaceholder>🔗</LinkPlaceholder>
                <LinkDetails>
                  <LinkTitle>{analytics.linkTitle || 'Untitled Link'}</LinkTitle>
                  <LinkUrl href={analytics.linkUrl} target="_blank" rel="noopener noreferrer">
                    {analytics.linkUrl}
                  </LinkUrl>
                </LinkDetails>
                <VisitButton href={analytics.linkUrl} target="_blank" rel="noopener noreferrer">
                  Visit Link ↗
                </VisitButton>
              </LinkPreviewCard>

              <PageHeader>
                <TitleSection>
                  <PageTitle>Performance</PageTitle>
                  <PageSubtitle>
                    Last {dateRange === '7d' ? '7' : dateRange === '30d' ? '30' : '90'} days
                  </PageSubtitle>
                </TitleSection>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </PageHeader>

              {/* Summary Stats */}
              <StatsGrid>
                <StatCard>
                  <StatLabel>Total Clicks</StatLabel>
                  <StatValue>{formatNumber(analytics.totalClicks)}</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Top Country</StatLabel>
                  <StatValue style={{ fontSize: '1.25rem' }}>
                    {analytics.byCountry[0]?.value || 'N/A'}
                  </StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Top Device</StatLabel>
                  <StatValue style={{ fontSize: '1.25rem' }}>
                    {analytics.byDevice[0]?.value || 'N/A'}
                  </StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Top Source</StatLabel>
                  <StatValue style={{ fontSize: '1.25rem' }}>
                    {analytics.byReferrer[0]?.value || 'Direct'}
                  </StatValue>
                </StatCard>
              </StatsGrid>

              {/* Time Series Chart */}
              <ChartsGrid>
                <ClicksChart
                  title="Clicks Over Time"
                  subtitle={`Last ${dateRange === '7d' ? '7' : dateRange === '30d' ? '30' : '90'} days`}
                  data={analytics.clicksOverTime}
                  primaryLabel="Clicks"
                />
              </ChartsGrid>

              {/* Breakdown Grid */}
              <BreakdownGrid>
                <GeoBreakdown
                  title="Countries"
                  subtitle="Where clicks come from"
                  data={analytics.byCountry}
                />
                <ReferrerList
                  title="Traffic Sources"
                  subtitle="How visitors find this link"
                  data={analytics.byReferrer}
                />
              </BreakdownGrid>

              <BreakdownGrid>
                <DeviceStats
                  title="Devices"
                  subtitle="Device breakdown"
                  data={analytics.byDevice}
                  type="device"
                />
                <DeviceStats
                  title="Browsers"
                  subtitle="Browser breakdown"
                  data={analytics.byBrowser}
                  type="browser"
                />
              </BreakdownGrid>
            </>
          ) : null}
        </ContentArea>
      </Main>
    </Container>
  );
};

export default LinkAnalyticsPage;
