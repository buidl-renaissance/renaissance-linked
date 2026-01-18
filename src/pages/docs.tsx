import React from "react";
import Head from "next/head";
import Link from "next/link";
import styled from "styled-components";

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  padding: 2rem 1rem;
  position: relative;
  
  background: 
    radial-gradient(ellipse at 50% 0%, rgba(22, 24, 28, 0.6) 0%, transparent 60%),
    #0B0B0D;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.025;
    pointer-events: none;
    z-index: 0;
  }
`;

const Content = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Header = styled.header`
  margin-bottom: 3rem;
`;

const BackLink = styled(Link)`
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textMuted};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  
  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const Title = styled.h1`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.signalWhite};
  letter-spacing: -0.04em;
  margin: 0 0 0.5rem;
`;

const Subtitle = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  letter-spacing: -0.02em;
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const EndpointCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const EndpointHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const MethodBadge = styled.span<{ $method: string }>`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: ${({ $method }) => {
    switch ($method) {
      case 'GET': return 'rgba(34, 197, 94, 0.2)';
      case 'POST': return 'rgba(59, 130, 246, 0.2)';
      case 'PUT': return 'rgba(234, 179, 8, 0.2)';
      case 'DELETE': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  }};
  color: ${({ $method }) => {
    switch ($method) {
      case 'GET': return '#22c55e';
      case 'POST': return '#3b82f6';
      case 'PUT': return '#eab308';
      case 'DELETE': return '#ef4444';
      default: return '#6b7280';
    }
  }};
`;

const EndpointPath = styled.code`
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};
`;

const EndpointDescription = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0 0 1rem;
  line-height: 1.6;
`;

const SubSection = styled.div`
  margin-top: 1rem;
`;

const SubSectionTitle = styled.h4`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 0.5rem;
`;

const CodeBlock = styled.pre`
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  color: ${({ theme }) => theme.text};
  line-height: 1.5;
  
  code {
    font-family: inherit;
  }
`;

const ParamTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
`;

const ParamRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ParamCell = styled.td`
  padding: 0.5rem 0;
  color: ${({ theme }) => theme.textMuted};
  vertical-align: top;
  
  &:first-child {
    color: ${({ theme }) => theme.text};
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.8rem;
    width: 140px;
  }
`;

const RequiredBadge = styled.span`
  font-size: 0.7rem;
  color: #ef4444;
  margin-left: 0.5rem;
`;

const OptionalBadge = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.textMuted};
  margin-left: 0.5rem;
`;

const Note = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textMuted};
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  
  strong {
    color: ${({ theme }) => theme.text};
  }
`;

const DocsPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>API Documentation — Linked</title>
        <meta name="description" content="API documentation for Linked" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <PageContainer>
        <Content>
          <Header>
            <BackLink href="/">← Back to Home</BackLink>
            <Title>API Documentation</Title>
            <Subtitle>REST API endpoints for managing your links</Subtitle>
          </Header>

          <Section>
            <SectionTitle>Authentication</SectionTitle>
            <EndpointDescription>
              All API endpoints require authentication via a session cookie. The cookie is set when you log in
              through the <code>/api/auth/phone-login</code> endpoint.
            </EndpointDescription>
          </Section>

          <Section>
            <SectionTitle>Links</SectionTitle>

            <EndpointCard>
              <EndpointHeader>
                <MethodBadge $method="GET">GET</MethodBadge>
                <EndpointPath>/api/links</EndpointPath>
              </EndpointHeader>
              <EndpointDescription>
                Retrieve all links for the authenticated user, ordered by position.
              </EndpointDescription>
              <SubSection>
                <SubSectionTitle>Response</SubSectionTitle>
                <CodeBlock>
{`{
  "links": [
    {
      "id": "uuid",
      "url": "https://example.com",
      "title": "Example Site",
      "description": "An example website",
      "imageUrl": "https://example.com/og.png",
      "favicon": "https://example.com/favicon.ico",
      "siteName": "Example",
      "position": 0,
      "isPublic": true,
      "clicks": 42,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}`}
                </CodeBlock>
              </SubSection>
            </EndpointCard>

            <EndpointCard>
              <EndpointHeader>
                <MethodBadge $method="POST">POST</MethodBadge>
                <EndpointPath>/api/links</EndpointPath>
              </EndpointHeader>
              <EndpointDescription>
                Create a new link. The link will be added at the end of the user&apos;s link list.
              </EndpointDescription>
              <SubSection>
                <SubSectionTitle>Request Body</SubSectionTitle>
                <ParamTable>
                  <tbody>
                    <ParamRow>
                      <ParamCell>url<RequiredBadge>required</RequiredBadge></ParamCell>
                      <ParamCell>The URL of the link</ParamCell>
                    </ParamRow>
                    <ParamRow>
                      <ParamCell>title<OptionalBadge>optional</OptionalBadge></ParamCell>
                      <ParamCell>Custom title for the link</ParamCell>
                    </ParamRow>
                    <ParamRow>
                      <ParamCell>description<OptionalBadge>optional</OptionalBadge></ParamCell>
                      <ParamCell>Custom description for the link</ParamCell>
                    </ParamRow>
                    <ParamRow>
                      <ParamCell>imageUrl<OptionalBadge>optional</OptionalBadge></ParamCell>
                      <ParamCell>Custom image URL (OG image)</ParamCell>
                    </ParamRow>
                    <ParamRow>
                      <ParamCell>favicon<OptionalBadge>optional</OptionalBadge></ParamCell>
                      <ParamCell>Custom favicon URL</ParamCell>
                    </ParamRow>
                    <ParamRow>
                      <ParamCell>siteName<OptionalBadge>optional</OptionalBadge></ParamCell>
                      <ParamCell>Custom site name</ParamCell>
                    </ParamRow>
                    <ParamRow>
                      <ParamCell>isPublic<OptionalBadge>optional</OptionalBadge></ParamCell>
                      <ParamCell>Whether the link is visible on public profile (default: true)</ParamCell>
                    </ParamRow>
                  </tbody>
                </ParamTable>
              </SubSection>
              <SubSection>
                <SubSectionTitle>Example Request</SubSectionTitle>
                <CodeBlock>
{`{
  "url": "https://example.com",
  "title": "My Example Link",
  "description": "A description of my link",
  "imageUrl": "https://example.com/image.png"
}`}
                </CodeBlock>
              </SubSection>
              <SubSection>
                <SubSectionTitle>Response</SubSectionTitle>
                <CodeBlock>
{`{
  "link": {
    "id": "uuid",
    "url": "https://example.com",
    "title": "My Example Link",
    "description": "A description of my link",
    "imageUrl": "https://example.com/image.png",
    "favicon": null,
    "siteName": null,
    "position": 0,
    "isPublic": true,
    "clicks": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}`}
                </CodeBlock>
              </SubSection>
            </EndpointCard>

            <EndpointCard>
              <EndpointHeader>
                <MethodBadge $method="PUT">PUT</MethodBadge>
                <EndpointPath>/api/links/[id]</EndpointPath>
              </EndpointHeader>
              <EndpointDescription>
                Update an existing link by ID.
              </EndpointDescription>
              <SubSection>
                <SubSectionTitle>Request Body</SubSectionTitle>
                <ParamTable>
                  <tbody>
                    <ParamRow>
                      <ParamCell>url<OptionalBadge>optional</OptionalBadge></ParamCell>
                      <ParamCell>New URL for the link</ParamCell>
                    </ParamRow>
                    <ParamRow>
                      <ParamCell>title<OptionalBadge>optional</OptionalBadge></ParamCell>
                      <ParamCell>New title</ParamCell>
                    </ParamRow>
                    <ParamRow>
                      <ParamCell>description<OptionalBadge>optional</OptionalBadge></ParamCell>
                      <ParamCell>New description</ParamCell>
                    </ParamRow>
                    <ParamRow>
                      <ParamCell>imageUrl<OptionalBadge>optional</OptionalBadge></ParamCell>
                      <ParamCell>New image URL</ParamCell>
                    </ParamRow>
                    <ParamRow>
                      <ParamCell>isPublic<OptionalBadge>optional</OptionalBadge></ParamCell>
                      <ParamCell>New visibility setting</ParamCell>
                    </ParamRow>
                  </tbody>
                </ParamTable>
              </SubSection>
            </EndpointCard>

            <EndpointCard>
              <EndpointHeader>
                <MethodBadge $method="DELETE">DELETE</MethodBadge>
                <EndpointPath>/api/links/[id]</EndpointPath>
              </EndpointHeader>
              <EndpointDescription>
                Delete a link by ID.
              </EndpointDescription>
              <SubSection>
                <SubSectionTitle>Response</SubSectionTitle>
                <CodeBlock>
{`{
  "success": true
}`}
                </CodeBlock>
              </SubSection>
            </EndpointCard>

            <EndpointCard>
              <EndpointHeader>
                <MethodBadge $method="POST">POST</MethodBadge>
                <EndpointPath>/api/links/reorder</EndpointPath>
              </EndpointHeader>
              <EndpointDescription>
                Reorder links by providing an array of link IDs in the desired order.
              </EndpointDescription>
              <SubSection>
                <SubSectionTitle>Request Body</SubSectionTitle>
                <CodeBlock>
{`{
  "linkIds": ["uuid1", "uuid2", "uuid3"]
}`}
                </CodeBlock>
              </SubSection>
            </EndpointCard>
          </Section>

          <Section>
            <SectionTitle>Metadata</SectionTitle>

            <EndpointCard>
              <EndpointHeader>
                <MethodBadge $method="POST">POST</MethodBadge>
                <EndpointPath>/api/metadata/fetch</EndpointPath>
              </EndpointHeader>
              <EndpointDescription>
                Fetch metadata (title, description, OG image, etc.) for a given URL.
              </EndpointDescription>
              <SubSection>
                <SubSectionTitle>Request Body</SubSectionTitle>
                <CodeBlock>
{`{
  "url": "https://example.com"
}`}
                </CodeBlock>
              </SubSection>
              <SubSection>
                <SubSectionTitle>Response</SubSectionTitle>
                <CodeBlock>
{`{
  "title": "Example Domain",
  "description": "Example description",
  "imageUrl": "https://example.com/og.png",
  "favicon": "https://example.com/favicon.ico",
  "siteName": "Example"
}`}
                </CodeBlock>
              </SubSection>
            </EndpointCard>
          </Section>

          <Section>
            <SectionTitle>Public Profile</SectionTitle>

            <EndpointCard>
              <EndpointHeader>
                <MethodBadge $method="GET">GET</MethodBadge>
                <EndpointPath>/api/profile/[username]</EndpointPath>
              </EndpointHeader>
              <EndpointDescription>
                Get a user&apos;s public profile and their public links. No authentication required.
              </EndpointDescription>
              <SubSection>
                <SubSectionTitle>Response</SubSectionTitle>
                <CodeBlock>
{`{
  "user": {
    "username": "johndoe",
    "displayName": "John Doe",
    "profilePicture": "https://..."
  },
  "links": [...]
}`}
                </CodeBlock>
              </SubSection>
            </EndpointCard>
          </Section>

          <Note>
            <strong>Note:</strong> All endpoints return appropriate HTTP status codes: 
            200 for success, 201 for creation, 400 for bad requests, 401 for unauthorized, 
            404 for not found, and 500 for server errors.
          </Note>
        </Content>
      </PageContainer>
    </>
  );
};

export default DocsPage;
