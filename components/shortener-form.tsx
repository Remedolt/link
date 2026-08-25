"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResultCard, type ShortenedLink } from "@/components/result-card";
import { isValidUrl, ALIAS_REGEX } from "@/lib/validations";
import { cn } from "@/lib/utils";

export function ShortenerForm() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [showAlias, setShowAlias] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortenedLink | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError("Please enter a URL");
      return;
    }
    if (!isValidUrl(trimmedUrl)) {
      setError("Enter a valid http(s) URL, e.g. https://example.com");
      return;
    }
    if (alias && !ALIAS_REGEX.test(alias)) {
      setError("Alias must be 3-30 characters: letters, numbers, - and _ only");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: trimmedUrl,
          customAlias: alias || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        toast.error(data.error ?? "Something went wrong");
        return;
      }

      setResult(data.link);
      setUrl("");
      setAlias("");
      setShowAlias(false);
      toast.success("Short link created");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card/60 p-2 shadow-lg shadow-black/5 backdrop-blur"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="text"
            inputMode="url"
            placeholder="Paste a long URL — https://example.com/very/long/path"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={cn(
              "h-12 flex-1 border-0 bg-transparent px-4 text-base shadow-none focus-visible:ring-0",
              error && "text-destructive",
            )}
            aria-invalid={!!error}
          />
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="h-12 shrink-0 px-6"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Shorten
          </Button>
        </div>

        <div className="border-t border-border/60 px-3 py-2">
          <button
            type="button"
            onClick={() => setShowAlias((s) => !s)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown
              className={cn("size-3.5 transition-transform", showAlias && "rotate-180")}
            />
            Custom alias (optional)
          </button>

          <AnimatePresence initial={false}>
            {showAlias && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 pt-3 pb-1">
                  <Label htmlFor="alias" className="shrink-0 text-xs text-muted-foreground">
                    snipp.link/
                  </Label>
                  <Input
                    id="alias"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="my-custom-name"
                    className="h-9"
                    maxLength={30}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      {error && (
        <p role="alert" className="px-1 text-sm text-destructive">
          {error}
        </p>
      )}

      <AnimatePresence>{result && <ResultCard link={result} />}</AnimatePresence>
    </div>
  );
}
