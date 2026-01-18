import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideUp} 0.3s ease-out;
`;

const Header = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.textMuted};
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const Content = styled.div`
  padding: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  font-size: 16px;
  color: ${({ theme }) => theme.text};
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
  }

  &::placeholder {
    color: ${({ theme }) => theme.textMuted};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  font-size: 16px;
  color: ${({ theme }) => theme.text};
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
  }

  &::placeholder {
    color: ${({ theme }) => theme.textMuted};
  }
`;

const UrlInputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const UrlInput = styled(Input)`
  flex: 1;
`;

const FetchButton = styled.button<{ $isLoading?: boolean }>`
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.accent};
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.accentHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const PreviewCard = styled.div`
  background: ${({ theme }) => theme.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const PreviewImage = styled.div<{ $hasImage: boolean }>`
  width: 100%;
  height: 120px;
  background: ${({ theme }) => theme.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PreviewPlaceholder = styled.div`
  color: ${({ theme }) => theme.textMuted};
  font-size: 2rem;
`;

const PreviewContent = styled.div`
  padding: 0.75rem;
`;

const PreviewSite = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  
  img {
    width: 14px;
    height: 14px;
    border-radius: 2px;
  }
  
  span {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.textMuted};
  }
`;

const PreviewTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const ToggleGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
`;

const ToggleLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ToggleLabelText = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const ToggleDescription = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textMuted};
`;

const Toggle = styled.button<{ $isActive: boolean }>`
  width: 48px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background: ${({ theme, $isActive }) => 
    $isActive ? theme.success : theme.border};
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${({ $isActive }) => ($isActive ? '23px' : '3px')};
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s ease;
  }
`;

const Footer = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  
  ${({ theme, $variant }) =>
    $variant === 'primary'
      ? `
        background: ${theme.accent};
        border: none;
        color: white;
        
        &:hover:not(:disabled) {
          background: ${theme.accentHover};
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 0.75rem;
  background: ${({ theme }) => `${theme.danger}20`};
  border: 1px solid ${({ theme }) => `${theme.danger}40`};
  border-radius: 8px;
  color: ${({ theme }) => theme.danger};
  font-size: 0.85rem;
`;

export interface LinkFormData {
  id?: string;
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  favicon: string;
  siteName: string;
  isPublic: boolean;
}

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LinkFormData) => Promise<void>;
  initialData?: LinkFormData | null;
}

export const AddLinkModal: React.FC<AddLinkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [favicon, setFavicon] = useState('');
  const [siteName, setSiteName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setUrl(initialData.url || '');
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setImageUrl(initialData.imageUrl || '');
      setFavicon(initialData.favicon || '');
      setSiteName(initialData.siteName || '');
      setIsPublic(initialData.isPublic ?? true);
    } else {
      setUrl('');
      setTitle('');
      setDescription('');
      setImageUrl('');
      setFavicon('');
      setSiteName('');
      setIsPublic(true);
    }
    setError(null);
    setImageError(false);
  }, [initialData, isOpen]);

  const handleFetchMetadata = useCallback(async () => {
    if (!url) return;

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch('/api/metadata/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch metadata');
      }

      const { metadata } = data;
      if (metadata.title) setTitle(metadata.title);
      if (metadata.description) setDescription(metadata.description);
      if (metadata.imageUrl) {
        setImageUrl(metadata.imageUrl);
        setImageError(false);
      }
      if (metadata.favicon) setFavicon(metadata.favicon);
      if (metadata.siteName) setSiteName(metadata.siteName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metadata');
    } finally {
      setIsFetching(false);
    }
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('URL is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        id: initialData?.id,
        url,
        title,
        description,
        imageUrl,
        favicon,
        siteName,
        isPublic,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save link');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{isEditing ? 'Edit Link' : 'Add New Link'}</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        <Content>
          <Form onSubmit={handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}

            <FieldGroup>
              <Label>URL *</Label>
              <UrlInputGroup>
                <UrlInput
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />
                <FetchButton
                  type="button"
                  onClick={handleFetchMetadata}
                  disabled={!url || isFetching}
                  $isLoading={isFetching}
                >
                  {isFetching ? <Spinner /> : 'Fetch'}
                </FetchButton>
              </UrlInputGroup>
            </FieldGroup>

            {(title || imageUrl || siteName) && (
              <PreviewCard>
                <PreviewImage $hasImage={!!imageUrl && !imageError}>
                  {imageUrl && !imageError ? (
                    <img 
                      src={imageUrl} 
                      alt="Preview"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <PreviewPlaceholder>🔗</PreviewPlaceholder>
                  )}
                </PreviewImage>
                <PreviewContent>
                  {siteName && (
                    <PreviewSite>
                      {favicon && <img src={favicon} alt="" />}
                      <span>{siteName}</span>
                    </PreviewSite>
                  )}
                  {title && <PreviewTitle>{title}</PreviewTitle>}
                </PreviewContent>
              </PreviewCard>
            )}

            <FieldGroup>
              <Label>Title</Label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Link title"
              />
            </FieldGroup>

            <FieldGroup>
              <Label>Description</Label>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the link"
              />
            </FieldGroup>

            <FieldGroup>
              <Label>Image URL</Label>
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageError(false);
                }}
                placeholder="https://example.com/image.jpg"
              />
            </FieldGroup>

            <ToggleGroup>
              <ToggleLabel>
                <ToggleLabelText>Public Link</ToggleLabelText>
                <ToggleDescription>
                  Show this link on your public profile
                </ToggleDescription>
              </ToggleLabel>
              <Toggle
                type="button"
                $isActive={isPublic}
                onClick={() => setIsPublic(!isPublic)}
              />
            </ToggleGroup>
          </Form>
        </Content>

        <Footer>
          <Button type="button" $variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            $variant="primary"
            onClick={handleSubmit}
            disabled={!url || isSaving}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Update Link' : 'Add Link'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default AddLinkModal;
