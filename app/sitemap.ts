import type { MetadataRoute } from "next";

import { getBaseUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/signin`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
