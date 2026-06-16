const DEFAULT_SITE_BASE_URL = 'https://nycpermitbrief.com';

function siteBaseUrl(env = process.env) {
  const configured = (env.SITE_BASE_URL || DEFAULT_SITE_BASE_URL).trim().replace(/\/+$/, '');
  let url;
  try {
    url = new URL(configured);
  } catch (error) {
    throw new Error(`SITE_BASE_URL must be a valid absolute URL: ${configured}`);
  }
  if (url.protocol !== 'https:') {
    throw new Error('SITE_BASE_URL must use https');
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_BASE_URL must include only scheme and host');
  }
  return url.origin;
}

module.exports = {
  DEFAULT_SITE_BASE_URL,
  siteBaseUrl,
};
