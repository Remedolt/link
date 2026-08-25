"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface QrCodeDialogProps {
  url: string;
  shortCode: string;
  /** Omit to render the dialog with its own icon-button trigger (default).
   *  Pass both to drive it as a controlled dialog with no built-in trigger —
   *  e.g. opened programmatically from a dropdown menu item. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function QrCodeDialog({ url, shortCode, open, onOpenChange }: QrCodeDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlled = open !== undefined;

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `snipp-${shortCode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!controlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Show QR code">
            <QrCode className="size-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Scan to open</DialogTitle>
          <DialogDescription>
            Anyone can scan this code to be redirected to your link.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center rounded-lg border border-border bg-white p-6">
          <QRCodeCanvas ref={canvasRef} value={url} size={200} marginSize={2} level="M" />
        </div>
        <DialogFooter>
          <Button onClick={handleDownload} className="w-full">
            <Download className="size-4" />
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
