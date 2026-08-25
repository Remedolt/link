import { UAParser } from "ua-parser-js";

export type DeviceType = "mobile" | "desktop" | "tablet" | "bot" | "unknown";

export interface ParsedRequestMeta {
  deviceType: DeviceType;
  browser: string | null;
  os: string | null;
}

/** Parse a User-Agent string into a coarse device type + browser/OS labels. */
export function parseUserAgent(userAgent: string | null): ParsedRequestMeta {
  if (!userAgent) {
    return { deviceType: "unknown", browser: null, os: null };
  }

  if (/bot|crawler|spider|crawling|slurp|bingpreview/i.test(userAgent)) {
    return { deviceType: "bot", browser: null, os: null };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const deviceTypeRaw = result.device.type;
  let deviceType: DeviceType = "desktop";
  if (deviceTypeRaw === "mobile") deviceType = "mobile";
  else if (deviceTypeRaw === "tablet") deviceType = "tablet";
  else if (!deviceTypeRaw) deviceType = "desktop";

  return {
    deviceType,
    browser: result.browser.name ?? null,
    os: result.os.name ?? null,
  };
}

/**
 * Best-effort geolocation from edge/proxy headers set by platforms like
 * Vercel (x-vercel-ip-country / -city) or Cloudflare (cf-ipcountry). No
 * external GeoIP call is made so the redirect stays fast.
 */
export function geoFromHeaders(headers: Headers): { country: string | null; city: string | null } {
  const country =
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-geo-country") ??
    null;
  const city =
    headers.get("x-vercel-ip-city") ??
    headers.get("x-geo-city") ??
    null;
  return {
    country: country ? decodeURIComponent(country) : null,
    city: city ? decodeURIComponent(city) : null,
  };
}
