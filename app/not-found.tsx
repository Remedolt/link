import Link from "next/link";
import { LinkIcon, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]" />
      <div className="relative flex flex-col items-center gap-6">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
          <LinkIcon className="size-7 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Link not found
          </h1>
          <p className="max-w-md text-balance text-muted-foreground">
            This short link doesn&apos;t exist, has expired, or has been
            disabled by its owner.
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to Snipp
          </Link>
        </Button>
      </div>
    </main>
  );
}
