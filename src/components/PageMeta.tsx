import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://jamesfloyds.world';
const DEFAULT_OG_IMAGE = `${SITE_URL}/pictures/Jets_&_Capital_Miami_BTS_Day_0-58.jpeg`;

interface PageMetaProps {
  /** Page-specific title. Will be suffixed with " | James Floyd". */
  title: string;
  /** One-sentence page description used for SEO + social. */
  description: string;
  /** Path on the site, e.g. "/sonder". Used to build canonical + og:url. */
  path: string;
  /** Optional Open Graph image (absolute URL recommended). */
  image?: string;
}

/**
 * Per-page metadata. Renders into <head> via react-helmet-async, overriding
 * the static defaults from index.html. Add this once at the top of every page
 * component that has a unique route.
 */
export const PageMeta = ({ title, description, path, image }: PageMetaProps) => {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} | James Floyd`;
  const ogImage = image || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default PageMeta;
