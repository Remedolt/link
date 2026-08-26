import {
  BarChart3,
  Gauge,
  Link2,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { ShortenerForm } from "@/components/shortener-form";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: Gauge,
    title: "Instant redirects",
    description:
      "Links resolve at the edge with a sub-100ms 302 redirect, no matter how much traffic they get.",
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    description:
      "Track clicks over time, devices, browsers, and top referrers from a single dashboard.",
  },
  {
    icon: Link2,
    title: "Custom aliases",
    description:
      "Brand your links with a memorable custom alias instead of a random string.",
  },
  {
    icon: QrCode,
    title: "QR codes, built in",
    description:
      "Every short link gets a downloadable QR code — perfect for print and in-person sharing.",
  },
  {
    icon: ShieldCheck,
    title: "Expiry & control",
    description:
      "Set expiration dates, disable links instantly, and keep anonymous traffic in check with rate limiting.",
  },
  {
    icon: Sparkles,
    title: "Clean, readable codes",
    description:
      "Auto-generated 6-character codes skip ambiguous characters so links are easy to read and type.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]" />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="size-3" />
              Free short links, no signup required
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Shorten links.
              <br />
              <span className="text-primary">Track everything.</span>
            </h1>
            <p className="mt-5 max-w-xl text-balance text-lg text-muted-foreground">
              Paste any URL and get a clean, shareable link in seconds —
              complete with QR codes and click analytics.
            </p>

            <div className="mt-10 w-full max-w-xl">
              <ShortenerForm />
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-secondary/20">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight">
                Everything you need from a link
              </h2>
              <p className="mt-3 text-muted-foreground">
                Built for people who share links a lot — and want to know what
                happens after the click.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
