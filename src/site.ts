export const SITE_URL = "https://brandinlewis.com";
export const SITE_NAME = "Brandin Lewis";
export const DEFAULT_DESCRIPTION = "Brandin Lewis — Product optimalist";
export const DEFAULT_OG_IMAGE = "/images/bl_headshot_website.webp";

export function absoluteUrl(path: string, site = SITE_URL): string {
  return new URL(path, site).href;
}
