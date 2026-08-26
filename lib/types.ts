export interface LinkRecord {
  id: string;
  originalUrl: string;
  shortCode: string;
  customAlias: string | null;
  title: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  clickCount: number;
  isActive: boolean;
}

export interface LinksResponse {
  links: LinkRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface NamedCount {
  name: string;
  count: number;
}

export interface AnalyticsSummary {
  totalClicks: number;
  totalLinks: number;
  activeLinks: number;
  topReferrers: NamedCount[];
  topCountries: NamedCount[];
  topBrowsers: NamedCount[];
  deviceBreakdown: NamedCount[];
  timeseries: { date: string; clicks: number }[];
}
