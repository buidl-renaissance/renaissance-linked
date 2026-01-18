import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const Card = styled.div<{ $isDragging?: boolean }>`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.3s ease-out;
  cursor: pointer;
  opacity: ${({ $isDragging }) => ($isDragging ? 0.5 : 1)};

  &:hover {
    border-color: ${({ theme }) => theme.accent};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${({ theme }) => theme.shadow};
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 140px;
  background: ${({ theme }) => theme.backgroundAlt};
  overflow: hidden;
`;

const LinkImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.backgroundAlt} 0%,
    ${({ theme }) => theme.surface} 50%,
    ${({ theme }) => theme.backgroundAlt} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 2s infinite;
`;

const PlaceholderIcon = styled.div`
  font-size: 2rem;
  color: ${({ theme }) => theme.textMuted};
`;

const ClicksBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${({ theme }) => theme.overlay};
  backdrop-filter: blur(8px);
  color: ${({ theme }) => theme.text};
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const VisibilityBadge = styled.div<{ $isPublic: boolean }>`
  position: absolute;
  top: 8px;
  left: 8px;
  background: ${({ theme, $isPublic }) => 
    $isPublic ? 'rgba(34, 197, 94, 0.2)' : 'rgba(107, 114, 128, 0.3)'};
  color: ${({ theme, $isPublic }) => 
    $isPublic ? theme.success : theme.textMuted};
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 8px;
  border-radius: 12px;
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const SiteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const Favicon = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 4px;
`;

const SiteName = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textMuted};
  text-transform: lowercase;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Description = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const UrlText = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.accent};
  display: block;
  margin-top: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.backgroundAlt};
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;

  &:hover {
    background: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.signalWhite};
    border-color: transparent;
  }
`;

const MenuWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const MenuButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;

  &:hover {
    background: ${({ theme }) => theme.backgroundAlt};
  }
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  bottom: calc(100% + 4px);
  right: 0;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  box-shadow: 0 8px 24px ${({ theme }) => theme.shadow};
  min-width: 140px;
  z-index: 100;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  overflow: hidden;
`;

const DropdownItem = styled.button<{ $variant?: 'danger' }>`
  width: 100%;
  padding: 0.65rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  border: none;
  background: transparent;
  color: ${({ theme, $variant }) => 
    $variant === 'danger' ? theme.danger : theme.text};
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ theme, $variant }) => 
      $variant === 'danger' ? `${theme.danger}20` : theme.backgroundAlt};
  }
`;

// QR Code Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 320px;
  width: 100%;
  text-align: center;
`;

const ModalTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem;
`;

const ModalSubtitle = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0 0 1.5rem;
  word-break: break-all;
`;

const QRCodeContainer = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 1.5rem;
`;

const QRCodeImage = styled.img`
  display: block;
  width: 200px;
  height: 200px;
`;

const ModalCloseButton = styled.button`
  padding: 0.75rem 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.backgroundAlt};
  }
`;

export interface LinkCardData {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  favicon: string | null;
  siteName: string | null;
  isPublic: boolean;
  clicks: number;
}

interface LinkCardProps {
  link: LinkCardData;
  onEdit?: (link: LinkCardData) => void;
  onDelete?: (linkId: string) => void;
  onClick?: (link: LinkCardData) => void;
  showActions?: boolean;
  isDragging?: boolean;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  onEdit,
  onDelete,
  onClick,
  showActions = true,
  isDragging = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) return;
    if ((e.target as HTMLElement).closest('[data-menu]')) return;
    onClick?.(link);
  };

  const handleShare = async () => {
    const shareData = {
      title: link.title || 'Check out this link',
      text: link.description || '',
      url: link.url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(link.url);
      alert('Link copied to clipboard!');
    }
  };

  const handleShowQR = () => {
    setQrModalOpen(true);
  };

  const getQRCodeUrl = (url: string) => {
    const encodedUrl = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}&bgcolor=ffffff&color=000000&margin=10`;
  };

  const displayUrl = (() => {
    try {
      const url = new URL(link.url);
      return url.hostname + (url.pathname !== '/' ? url.pathname : '');
    } catch {
      return link.url;
    }
  })();

  return (
    <>
      <Card $isDragging={isDragging} onClick={handleCardClick}>
        <ImageContainer>
          {link.imageUrl && !imageError ? (
            <LinkImage
              src={link.imageUrl}
              alt={link.title || 'Link preview'}
              onError={() => setImageError(true)}
            />
          ) : (
            <PlaceholderImage>
              <PlaceholderIcon>🔗</PlaceholderIcon>
            </PlaceholderImage>
          )}
          <ClicksBadge>
            <span>👆</span>
            <span>{link.clicks}</span>
          </ClicksBadge>
          <VisibilityBadge $isPublic={link.isPublic}>
            {link.isPublic ? 'Public' : 'Private'}
          </VisibilityBadge>
        </ImageContainer>

        <CardContent>
          <SiteInfo>
            {link.favicon && !faviconError ? (
              <Favicon
                src={link.favicon}
                alt=""
                onError={() => setFaviconError(true)}
              />
            ) : null}
            <SiteName>{link.siteName || displayUrl}</SiteName>
          </SiteInfo>

          <Title>{link.title || 'Untitled Link'}</Title>
          
          {link.description && (
            <Description>{link.description}</Description>
          )}

          <UrlText>{displayUrl}</UrlText>
        </CardContent>

        {showActions && (
          <Actions>
            <ActionButton onClick={handleShare}>
              <span>↗</span>
              Share
            </ActionButton>
            <ActionButton onClick={handleShowQR}>
              <span>⊞</span>
              QR
            </ActionButton>
            <MenuWrapper ref={menuRef} data-menu>
              <MenuButton onClick={() => setMenuOpen(!menuOpen)}>
                <span>⋮</span>
                More
              </MenuButton>
              <DropdownMenu $isOpen={menuOpen}>
                <DropdownItem onClick={() => {
                  setMenuOpen(false);
                  onEdit?.(link);
                }}>
                  <span>✎</span>
                  Edit
                </DropdownItem>
                <DropdownItem 
                  $variant="danger" 
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(link.id);
                  }}
                >
                  <span>🗑</span>
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </MenuWrapper>
          </Actions>
        )}
      </Card>

      {qrModalOpen && (
        <ModalOverlay onClick={() => setQrModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{link.title || 'QR Code'}</ModalTitle>
            <ModalSubtitle>{link.url}</ModalSubtitle>
            <QRCodeContainer>
              <QRCodeImage 
                src={getQRCodeUrl(link.url)} 
                alt="QR Code"
              />
            </QRCodeContainer>
            <ModalCloseButton onClick={() => setQrModalOpen(false)}>
              Close
            </ModalCloseButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default LinkCard;
