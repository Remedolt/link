import Link from "next/link";
import { LinkIcon } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LinkIcon className="size-4" />
          </span>
          <span className="text-lg">Snipp</span>
        </Link>

        <nav className="flex items-center gap-2">
          {session?.user ? (
            <UserMenu
              name={session.user.name}
              email={session.user.email}
              image={session.user.image}
            />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
