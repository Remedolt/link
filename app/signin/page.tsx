import { Suspense } from "react";
import Link from "next/link";
import { LinkIcon } from "lucide-react";
import type { Metadata } from "next";

import { SignInForm } from "@/components/auth-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Sign in" };

const googleEnabled = !!process.env.GOOGLE_CLIENT_ID;

export default function SignInPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold tracking-tight">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LinkIcon className="size-4" />
        </span>
        <span className="text-lg">Snipp</span>
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense>
            <SignInForm googleEnabled={googleEnabled} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
