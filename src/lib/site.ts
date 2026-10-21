// The public address of the site: the Vercel production URL when deployed.
export function siteUrl() {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return host ? `https://${host}` : "http://localhost:3000";
}
