import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import styled, { keyframes } from 'styled-components';
import { getUserByUsername } from '@/db/user';
import { getPublicLinksByUserId, Link } from '@/db/links';

const APP_NAME = 'Linked';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const stagger = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem 4rem;
`;

const ProfileSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const AvatarContainer = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 1rem;
  border: 3px solid ${({ theme }) => theme.accent};
  background: ${({ theme }) => theme.surface};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarFallback = styled.span`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
`;

const DisplayName = styled.h1`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.25rem;
`;

const Username = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0;
`;

const LinksContainer = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LinkCardWrapper = styled.a<{ $index: number }>`
  display: block;
  text-decoration: none;
  animation: ${stagger} 0.5s ease-out;
  animation-delay: ${({ $index }) => $index * 0.1}s;
  animation-fill-mode: both;
`;

const LinkCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.accent};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${({ theme }) => theme.shadow};
  }
`;

const LinkContent = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
`;

const LinkImageContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: ${({ theme }) => theme.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LinkImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const LinkPlaceholder = styled.div`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.textMuted};
`;

const LinkDetails = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const LinkSite = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;

  img {
    width: 14px;
    height: 14px;
    border-radius: 2px;
  }

  span {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.textMuted};
    text-transform: lowercase;
  }
`;

const LinkTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LinkDescription = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: ${({ theme }) => theme.surface};
  border: 2px dashed ${({ theme }) => theme.border};
  border-radius: 12px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
`;

const EmptyText = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0;
`;

const Footer = styled.footer`
  margin-top: auto;
  padding-top: 3rem;
  text-align: center;
`;

const FooterText = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0;

  a {
    color: ${({ theme }) => theme.accent};
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const NotFoundContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: ${({ theme }) => theme.background};
`;

const NotFoundIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const NotFoundTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem;
`;

const NotFoundText = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0;
`;

interface PublicLink {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  favicon: string | null;
  siteName: string | null;
}

interface ProfileData {
  username: string;
  displayName: string;
  pfpUrl: string | null;
}

interface PublicProfilePageProps {
  profile: ProfileData | null;
  links: PublicLink[];
  notFound: boolean;
}

const PublicProfilePage: React.FC<PublicProfilePageProps> = ({
  profile,
  links,
  notFound,
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (notFound || !profile) {
    return (
      <NotFoundContainer>
        <Head>
          <title>{`Profile Not Found | ${APP_NAME}`}</title>
        </Head>
        <NotFoundIcon>🔍</NotFoundIcon>
        <NotFoundTitle>Profile Not Found</NotFoundTitle>
        <NotFoundText>
          This profile doesn&apos;t exist or has been removed.
        </NotFoundText>
      </NotFoundContainer>
    );
  }

  const initials = profile.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleImageError = (linkId: string) => {
    setImageErrors((prev) => ({ ...prev, [linkId]: true }));
  };

  return (
    <Container>
      <Head>
        <title>{`${profile.displayName} | ${APP_NAME}`}</title>
        <meta
          name="description"
          content={`Check out ${profile.displayName}'s links on ${APP_NAME}`}
        />
        <meta property="og:title" content={`${profile.displayName} on ${APP_NAME}`} />
        <meta
          property="og:description"
          content={`Check out ${profile.displayName}'s links on ${APP_NAME}`}
        />
        {profile.pfpUrl && (
          <meta property="og:image" content={profile.pfpUrl} />
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ProfileSection>
        <AvatarContainer>
          {profile.pfpUrl && !avatarError ? (
            <Avatar
              src={profile.pfpUrl}
              alt={profile.displayName}
              onError={() => setAvatarError(true)}
            />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </AvatarContainer>
        <DisplayName>{profile.displayName}</DisplayName>
        <Username>@{profile.username}</Username>
      </ProfileSection>

      <LinksContainer>
        {links.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🔗</EmptyIcon>
            <EmptyText>No links shared yet</EmptyText>
          </EmptyState>
        ) : (
          links.map((link, index) => (
            <LinkCardWrapper
              key={link.id}
              href={`/go/${link.id}`}
              target="_blank"
              rel="noopener noreferrer"
              $index={index}
            >
              <LinkCard>
                <LinkContent>
                  <LinkImageContainer>
                    {link.imageUrl && !imageErrors[link.id] ? (
                      <LinkImage
                        src={link.imageUrl}
                        alt={link.title || 'Link'}
                        onError={() => handleImageError(link.id)}
                      />
                    ) : (
                      <LinkPlaceholder>🔗</LinkPlaceholder>
                    )}
                  </LinkImageContainer>
                  <LinkDetails>
                    {link.siteName && (
                      <LinkSite>
                        {link.favicon && (
                          <img src={link.favicon} alt="" />
                        )}
                        <span>{link.siteName}</span>
                      </LinkSite>
                    )}
                    <LinkTitle>{link.title || 'Untitled Link'}</LinkTitle>
                    {link.description && (
                      <LinkDescription>{link.description}</LinkDescription>
                    )}
                  </LinkDetails>
                </LinkContent>
              </LinkCard>
            </LinkCardWrapper>
          ))
        )}
      </LinksContainer>

      <Footer>
        <FooterText>
          Powered by <a href="/">{APP_NAME}</a>
        </FooterText>
      </Footer>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps<PublicProfilePageProps> = async (
  context
) => {
  const { username } = context.params as { username: string };

  // Reserved paths that shouldn't be treated as usernames
  const reservedPaths = [
    'app',
    'login',
    'register',
    'dashboard',
    'api',
    'go',
    '_next',
    'favicon.ico',
  ];

  if (reservedPaths.includes(username.toLowerCase())) {
    return { notFound: true };
  }

  try {
    // Find user by username
    const user = await getUserByUsername(username);

    if (!user) {
      return {
        props: {
          profile: null,
          links: [],
          notFound: true,
        },
      };
    }

    // Get public links
    const userLinks = await getPublicLinksByUserId(user.id);

    return {
      props: {
        profile: {
          username: user.username || username,
          displayName: user.displayName || user.name || user.username || username,
          pfpUrl: user.pfpUrl || user.profilePicture || null,
        },
        links: userLinks.map((link: Link) => ({
          id: link.id,
          url: link.url,
          title: link.title,
          description: link.description,
          imageUrl: link.imageUrl,
          favicon: link.favicon,
          siteName: link.siteName,
        })),
        notFound: false,
      },
    };
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return {
      props: {
        profile: null,
        links: [],
        notFound: true,
      },
    };
  }
};

export default PublicProfilePage;
