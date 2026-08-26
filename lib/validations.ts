import { z } from "zod";

/**
 * Practical URL validation: requires http(s) protocol, a host with at least
 * one dot (or "localhost"), and disallows spaces. Using the built-in `URL`
 * constructor first, then a regex as a stricter secondary check, so wildly
 * malformed strings never reach the database.
 */
const URL_REGEX =
  /^https?:\/\/(localhost|[\w-]+(\.[\w-]+)+)(:\d{1,5})?(\/[^\s]*)?$/i;

export function isValidUrl(value: string): boolean {
  if (!URL_REGEX.test(value)) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Alias rules: 3-30 chars, letters/numbers/hyphen/underscore only. */
export const ALIAS_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

// Short codes we never want to hand out or allow as a custom alias, since
// they collide with real app routes.
export const RESERVED_CODES = new Set([
  "api",
  "dashboard",
  "signin",
  "signup",
  "login",
  "logout",
  "register",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "_next",
  "auth",
]);

export const shortenSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .min(1, "Please enter a URL")
    .refine(isValidUrl, "Enter a valid http(s) URL, e.g. https://example.com"),
  customAlias: z
    .string()
    .trim()
    .regex(ALIAS_REGEX, "3-30 characters: letters, numbers, - and _ only")
    .optional()
    .or(z.literal("")),
  expiresAt: z.string().datetime().optional().nullable(),
});

export type ShortenInput = z.infer<typeof shortenSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
