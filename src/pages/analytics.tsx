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

const TitleSection = styled.div``;

const PageTitle = styled.h1`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const PageSubtitle = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0.25rem 0 0;
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
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
`;

const StatChange = styled.span<{ $positive: boolean }>`
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme, $positive }) => ($positive ? theme.success : theme.danger)};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 1rem;
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

const TopLinksCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.5rem;
`;

const TopLinksHeader = styled.div`
  margin-bottom: 1rem;
`;

const TopLinksTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const TopLinksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TopLinkItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.surface};
    border-color: ${({ theme }) => theme.accent};
    transform: translateX(4px);
  }
`;

const TopLinkRank = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
  min-width: 1.5rem;
`;

const TopLinkDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const TopLinkTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TopLinkUrl = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TopLinkClicks = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  white-space: nowrap;
`;

const EmptyTopLinks = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.9rem;
`;

interface AnalyticsSummary {
  totalClicks: number;
  totalProfileViews: number;
  clicksChange: number;
  viewsChange: number;
  topCountries: { value: string; count: number }[];
  topDevices: { value: string; count: number }[];
  topReferrers: { value: string; count: number }[];
  topLinks: { linkId: string; title: string | null; url: string; clicks: number }[];
  clicksOverTime: { date: string; count: number }[];
  viewsOverTime: { date: string; count: number }[];
}

const AnalyticsPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [dateRange, setDateRange] = useState<DateRangeOption>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/summary?range=${dateRange}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/app');
          return;
        }
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/app');
    }
  }, [isUserLoading, user, router]);

  // Fetch analytics when user is available or date range changes
  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, fetchAnalytics]);

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

  const formatChange = (change: number) => {
    if (change > 0) return `+${change}%`;
    if (change < 0) return `${change}%`;
    return '0%';
  };

  return (
    <Container>
      <Head>
        <title>{`Analytics | ${APP_NAME}`}</title>
        <meta name="description" content={`Analytics dashboard for ${APP_NAME}`} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Main>
        <Header>
          <BackButton onClick={handleBack}>
            ← Dashboard
          </BackButton>
          <HeaderTitle>Analytics</HeaderTitle>
          <div style={{ width: 80 }} />
        </Header>

        <HeaderSpacer />

        <ContentArea>
          <PageHeader>
            <TitleSection>
              <PageTitle>Analytics</PageTitle>
              <PageSubtitle>
                Track your link performance and audience insights
              </PageSubtitle>
            </TitleSection>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </PageHeader>

          {isLoading ? (
            <Loading text="Loading analytics..." />
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#EF4444' }}>
              {error}
            </div>
          ) : analytics ? (
            <>
              {/* Summary Stats */}
              <StatsGrid>
                <StatCard>
                  <StatLabel>Total Clicks</StatLabel>
                  <StatValue>
                    {formatNumber(analytics.totalClicks)}
                    <StatChange $positive={analytics.clicksChange >= 0}>
                      {analytics.clicksChange >= 0 ? '↑' : '↓'}
                      {formatChange(analytics.clicksChange)}
                    </StatChange>
                  </StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Profile Views</StatLabel>
                  <StatValue>
                    {formatNumber(analytics.totalProfileViews)}
                    <StatChange $positive={analytics.viewsChange >= 0}>
                      {analytics.viewsChange >= 0 ? '↑' : '↓'}
                      {formatChange(analytics.viewsChange)}
                    </StatChange>
                  </StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Click Rate</StatLabel>
                  <StatValue>
                    {analytics.totalProfileViews > 0
                      ? `${Math.round((analytics.totalClicks / analytics.totalProfileViews) * 100)}%`
                      : '0%'}
                  </StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Top Country</StatLabel>
                  <StatValue style={{ fontSize: '1.25rem' }}>
                    {analytics.topCountries[0]?.value || 'N/A'}
                  </StatValue>
                </StatCard>
              </StatsGrid>

              {/* Time Series Chart */}
              <ChartsGrid>
                <ClicksChart
                  title="Traffic Over Time"
                  subtitle={`Last ${dateRange === '7d' ? '7' : dateRange === '30d' ? '30' : '90'} days`}
                  data={analytics.clicksOverTime}
                  secondaryData={analytics.viewsOverTime}
                  primaryLabel="Clicks"
                  secondaryLabel="Views"
                />
              </ChartsGrid>

              {/* Breakdown Grid */}
              <BreakdownGrid>
                <GeoBreakdown
                  title="Top Countries"
                  subtitle="Where your visitors come from"
                  data={analytics.topCountries}
                />
                <ReferrerList
                  title="Traffic Sources"
                  subtitle="How visitors find your links"
                  data={analytics.topReferrers}
                />
              </BreakdownGrid>

              <BreakdownGrid>
                <DeviceStats
                  title="Devices"
                  subtitle="What devices visitors use"
                  data={analytics.topDevices}
                  type="device"
                />

                {/* Top Links */}
                <TopLinksCard>
                  <TopLinksHeader>
                    <TopLinksTitle>Top Performing Links</TopLinksTitle>
                  </TopLinksHeader>
                  {analytics.topLinks.length === 0 ? (
                    <EmptyTopLinks>No link clicks yet</EmptyTopLinks>
                  ) : (
                    <TopLinksList>
                      {analytics.topLinks.map((link, index) => (
                        <TopLinkItem 
                          key={link.linkId}
                          onClick={() => router.push(`/analytics/link/${link.linkId}`)}
                        >
                          <TopLinkRank>#{index + 1}</TopLinkRank>
                          <TopLinkDetails>
                            <TopLinkTitle>{link.title || 'Untitled'}</TopLinkTitle>
                            <TopLinkUrl>{link.url}</TopLinkUrl>
                          </TopLinkDetails>
                          <TopLinkClicks>
                            {link.clicks.toLocaleString()} clicks
                          </TopLinkClicks>
                        </TopLinkItem>
                      ))}
                    </TopLinksList>
                  )}
                </TopLinksCard>
              </BreakdownGrid>
            </>
          ) : null}
        </ContentArea>
      </Main>
    </Container>
  );
};

export default AnalyticsPage;
