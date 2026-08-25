"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, ExternalLink, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { QrCodeDialog } from "@/components/qr-code-dialog";

export interface ShortenedLink {
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
}

export function ResultCard({ link }: { link: ShortenedLink }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link.shortUrl);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — copy it manually instead");
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ url: link.shortUrl, title: "Check out this link" });
      } catch {
        // user cancelled — no-op
      }
    } else {
      await handleCopy();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">{link.originalUrl}</p>
          <a
            href={link.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 text-lg font-medium text-primary hover:underline"
          >
            {link.shortUrl.replace(/^https?:\/\//, "")}
            <ExternalLink className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share link">
            <Share2 className="size-4" />
          </Button>
          <QrCodeDialog url={link.shortUrl} shortCode={link.shortCode} />
          <Button onClick={handleCopy} className="gap-1.5">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
