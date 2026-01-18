import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/router";
import { useUser } from "@/contexts/UserContext";
import { Loading } from "@/components/Loading";
import { LinkCard, LinkCardData } from "@/components/LinkCard";
import { AddLinkModal, LinkFormData } from "@/components/AddLinkModal";

// App configuration
const APP_NAME = "Linked";

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

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ProfileImageContainer = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.accent};
  background: ${({ theme }) => theme.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DefaultAvatar = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
`;

const UserName = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textMuted};
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    color: ${({ theme }) => theme.text};
    border-color: ${({ theme }) => theme.textMuted};
    background: ${({ theme }) => theme.backgroundAlt};
  }
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

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

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: ${({ theme }) => theme.accent};
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.accentHover};
    transform: translateY(-1px);
  }
`;

const StatsBar = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 1rem 1.25rem;
  min-width: 120px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textMuted};
  margin-top: 0.25rem;
`;

const ShareSection = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ShareLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textMuted};
`;

const ShareLink = styled.div`
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
`;

const ShareUrl = styled.span`
  flex: 1;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.accent};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CopyButton = styled.button`
  background: ${({ theme }) => theme.accent};
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.accentHover};
  }
`;

const LinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: ${({ theme }) => theme.surface};
  border: 2px dashed ${({ theme }) => theme.border};
  border-radius: 12px;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem;
`;

const EmptyText = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0;
`;

const ConfirmDialog = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 1rem;
`;

const ConfirmBox = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
`;

const ConfirmTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem;
`;

const ConfirmText = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0 0 1.5rem;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

const ConfirmButton = styled.button<{ $variant?: 'danger' }>`
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  ${({ theme, $variant }) =>
    $variant === 'danger'
      ? `
        background: ${theme.danger};
        border: none;
        color: white;
        
        &:hover {
          opacity: 0.9;
        }
      `
      : `
        background: transparent;
        border: 1px solid ${theme.border};
        color: ${theme.text};
        
        &:hover {
          background: ${theme.backgroundAlt};
        }
      `}
`;

interface Link extends LinkCardData {
  userId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading, signOut } = useUser();
  const [imageError, setImageError] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkFormData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch links
  const fetchLinks = useCallback(async () => {
    try {
      const response = await fetch('/api/links');
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links || []);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setIsLoadingLinks(false);
    }
  }, []);

  // Redirect to /app if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/app');
    }
  }, [isUserLoading, user, router]);

  // Fetch links when user is available
  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user, fetchLinks]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const handleAddLink = () => {
    setEditingLink(null);
    setIsModalOpen(true);
  };

  const handleEditLink = (link: LinkCardData) => {
    setEditingLink({
      id: link.id,
      url: link.url,
      title: link.title || '',
      description: link.description || '',
      imageUrl: link.imageUrl || '',
      favicon: link.favicon || '',
      siteName: link.siteName || '',
      isPublic: link.isPublic,
    });
    setIsModalOpen(true);
  };

  const handleSaveLink = async (data: LinkFormData) => {
    if (data.id) {
      // Update existing link
      const response = await fetch(`/api/links/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update link');
      }
    } else {
      // Create new link
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create link');
      }
    }

    // Refresh links
    await fetchLinks();
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== linkId));
      }
    } catch (error) {
      console.error('Error deleting link:', error);
    }
    setDeleteConfirm(null);
  };

  const handleCopyProfileLink = () => {
    if (!user?.username) return;
    
    const profileUrl = `${window.location.origin}/${user.username}`;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (isUserLoading && !user) {
    return <Loading text="Loading..." />;
  }

  if (!isUserLoading && !user) {
    return null;
  }

  if (!user) {
    return null;
  }

  const displayName = user.username || user.displayName || `User`;
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  
  // Hide sign out for Renaissance-authenticated users (they manage auth in the parent app)
  const isRenaissanceUser = !!user.renaissanceId;

  // Calculate stats
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  const publicLinks = links.filter((l) => l.isPublic).length;

  return (
    <Container>
      <Head>
        <title>{`My Links | ${APP_NAME}`}</title>
        <meta name="description" content={`Manage your links on ${APP_NAME}`} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Main>
        <Header>
          <UserSection>
            <ProfileImageContainer>
              {user.pfpUrl && !imageError ? (
                <ProfileImage
                  src={user.pfpUrl}
                  alt={displayName}
                  onError={() => setImageError(true)}
                />
              ) : (
                <DefaultAvatar>{initials}</DefaultAvatar>
              )}
            </ProfileImageContainer>
            <UserName>{displayName}</UserName>
          </UserSection>
          <HeaderRight>
            {!isRenaissanceUser && (
              <LogoutButton onClick={handleLogout}>
                Sign Out
              </LogoutButton>
            )}
          </HeaderRight>
        </Header>

        <HeaderSpacer />
        
        <ContentArea>
          <PageHeader>
            <div>
              <PageTitle>My Links</PageTitle>
              <PageSubtitle>
                Manage and share your important links
              </PageSubtitle>
            </div>
            <AddButton onClick={handleAddLink}>
              <span>+</span>
              Add Link
            </AddButton>
          </PageHeader>

          <StatsBar>
            <StatCard>
              <StatValue>{links.length}</StatValue>
              <StatLabel>Total Links</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{publicLinks}</StatValue>
              <StatLabel>Public Links</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{totalClicks}</StatValue>
              <StatLabel>Total Clicks</StatLabel>
            </StatCard>
          </StatsBar>

          {user.username && (
            <ShareSection>
              <ShareLabel>Your public profile:</ShareLabel>
              <ShareLink>
                <ShareUrl>
                  {typeof window !== 'undefined' ? window.location.origin : ''}/{user.username}
                </ShareUrl>
                <CopyButton onClick={handleCopyProfileLink}>
                  {copied ? 'Copied!' : 'Copy'}
                </CopyButton>
              </ShareLink>
            </ShareSection>
          )}

          {isLoadingLinks ? (
            <Loading text="Loading links..." />
          ) : links.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🔗</EmptyIcon>
              <EmptyTitle>No links yet</EmptyTitle>
              <EmptyText>
                Add your first link to start sharing with your audience
              </EmptyText>
            </EmptyState>
          ) : (
            <LinksGrid>
              {links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onEdit={handleEditLink}
                  onDelete={(id) => setDeleteConfirm(id)}
                />
              ))}
            </LinksGrid>
          )}
        </ContentArea>
      </Main>

      <AddLinkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLink}
        initialData={editingLink}
      />

      {deleteConfirm && (
        <ConfirmDialog onClick={() => setDeleteConfirm(null)}>
          <ConfirmBox onClick={(e) => e.stopPropagation()}>
            <ConfirmTitle>Delete Link?</ConfirmTitle>
            <ConfirmText>
              This action cannot be undone. The link will be permanently removed.
            </ConfirmText>
            <ConfirmButtons>
              <ConfirmButton onClick={() => setDeleteConfirm(null)}>
                Cancel
              </ConfirmButton>
              <ConfirmButton
                $variant="danger"
                onClick={() => handleDeleteLink(deleteConfirm)}
              >
                Delete
              </ConfirmButton>
            </ConfirmButtons>
          </ConfirmBox>
        </ConfirmDialog>
      )}
    </Container>
  );
};

export default DashboardPage;
