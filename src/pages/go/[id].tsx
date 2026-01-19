import { GetServerSideProps } from 'next';
import { getLinkById, incrementLinkClicks } from '@/db/links';
import { recordLinkClick } from '@/db/analytics';
import { extractAnalyticsMetadata } from '@/utils/analytics';

/**
 * Link Redirect Page
 * Tracks clicks and redirects to the actual URL
 * This is a server-side only page - it never renders on the client
 */
const RedirectPage = () => {
  // This component should never render
  // The redirect happens in getServerSideProps
  return null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  const { req } = context;

  try {
    // Get the link
    const link = await getLinkById(id);

    if (!link) {
      // Link not found - redirect to home
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    // Extract analytics metadata from request headers
    const headers = req.headers as Record<string, string | string[] | undefined>;
    const metadata = await extractAnalyticsMetadata(headers);

    // Record detailed click event (async, don't block redirect)
    // Also increment the simple click counter for quick stats
    await Promise.all([
      recordLinkClick(id, metadata),
      incrementLinkClicks(id),
    ]);

    // Redirect to the actual URL
    return {
      redirect: {
        destination: link.url,
        permanent: false,
      },
    };
  } catch (error) {
    console.error('Error in redirect:', error);
    
    // On error, redirect to home
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
};

export default RedirectPage;
