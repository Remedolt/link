import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getBaseUrl } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "Snipp — Short links that don't quit",
    template: "%s · Snipp",
  },
  description:
    "Shorten long URLs into clean, trackable links in seconds. Custom aliases, QR codes, and real-time click analytics — free to start.",
  keywords: [
    "url shortener",
    "link shortener",
    "short link",
    "custom alias",
    "qr code generator",
    "link analytics",
  ],
  openGraph: {
    title: "Snipp — Short links that don't quit",
    description:
      "Shorten long URLs into clean, trackable links in seconds. Custom aliases, QR codes, and real-time click analytics.",
    type: "website",
    siteName: "Snipp",
  },
  twitter: {
    card: "summary_large_image",
    title: "Snipp — Short links that don't quit",
    description:
      "Shorten long URLs into clean, trackable links in seconds. Custom aliases, QR codes, and real-time click analytics.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
