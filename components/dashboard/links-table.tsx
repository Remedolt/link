"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  Copy,
  ExternalLink,
  MoreHorizontal,
  QrCode,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QrCodeDialog } from "@/components/qr-code-dialog";
import { CreateLinkDialog } from "@/components/dashboard/create-link-dialog";
import { formatDate, formatNumber, getBaseUrl } from "@/lib/utils";
import type { LinksResponse, LinkRecord } from "@/lib/types";

const PAGE_SIZE = 10;

export function LinksTable() {
  const [data, setData] = useState<LinksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [qrTarget, setQrTarget] = useState<LinkRecord | null>(null);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      q,
      sort,
      order,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    try {
      const res = await fetch(`/api/links?${params.toString()}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [q, sort, order, page]);

  useEffect(() => {
    const timeout = setTimeout(fetchLinks, q ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchLinks]);

  function toggleSort(field: string) {
    if (sort === field) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setOrder("desc");
    }
    setPage(1);
  }

  async function handleCopy(shortUrl: string) {
    await navigator.clipboard.writeText(shortUrl);
    toast.success("Copied to clipboard");
  }

  async function handleToggleActive(link: LinkRecord) {
    const res = await fetch(`/api/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !link.isActive }),
    });
    if (res.ok) {
      toast.success(link.isActive ? "Link disabled" : "Link enabled");
      fetchLinks();
    } else {
      toast.error("Couldn't update link");
    }
  }

  async function handleDelete(link: LinkRecord) {
    const res = await fetch(`/api/links/${link.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Link deleted");
      fetchLinks();
    } else {
      toast.error("Couldn't delete link");
    }
  }

  const links = data?.links ?? [];
  const pagination = data?.pagination;
  const qrShortUrl = qrTarget
    ? `${getBaseUrl()}/${qrTarget.customAlias ?? qrTarget.shortCode}`
    : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search links..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={sort}
            onValueChange={(v) => {
              setSort(v);
              setPage(1);
            }}
          >
            <SelectTrigger size="sm" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date created</SelectItem>
              <SelectItem value="clickCount">Click count</SelectItem>
              <SelectItem value="originalUrl">Original URL</SelectItem>
              <SelectItem value="shortCode">Short code</SelectItem>
            </SelectContent>
          </Select>
          <CreateLinkDialog onCreated={fetchLinks} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Link</TableHead>
              <TableHead className="hidden md:table-cell">Destination</TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort("clickCount")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Clicks <ArrowUpDown className="size-3" />
                </button>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <button
                  onClick={() => toggleSort("createdAt")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Created <ArrowUpDown className="size-3" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && !data ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No links yet — create your first one above.
                </TableCell>
              </TableRow>
            ) : (
              links.map((link) => {
                const shortUrl = `${getBaseUrl()}/${link.customAlias ?? link.shortCode}`;
                const expired = link.expiresAt && new Date(link.expiresAt) < new Date();
                return (
                  <TableRow key={link.id}>
                    <TableCell>
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        /{link.customAlias ?? link.shortCode}
                        <ExternalLink className="size-3" />
                      </a>
                    </TableCell>
                    <TableCell className="hidden max-w-64 truncate text-muted-foreground md:table-cell">
                      {link.originalUrl}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatNumber(link.clickCount)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {formatDate(link.createdAt)}
                    </TableCell>
                    <TableCell>
                      {expired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : link.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleCopy(shortUrl)}>
                            <Copy className="size-4" /> Copy link
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setQrTarget(link)}>
                            <QrCode className="size-4" /> QR code
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleToggleActive(link)}>
                            {link.isActive ? "Disable" : "Enable"} link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => handleDelete(link)}
                          >
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {qrTarget && (
        <QrCodeDialog
          url={qrShortUrl}
          shortCode={qrTarget.shortCode}
          open={!!qrTarget}
          onOpenChange={(open) => !open && setQrTarget(null)}
        />
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Page {pagination.page} of {pagination.totalPages} ·{" "}
            {formatNumber(pagination.total)} links
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
