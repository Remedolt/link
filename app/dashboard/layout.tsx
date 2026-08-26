import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";

// Belt-and-suspenders alongside proxy.ts — keeps this route safe even if
// someone reaches it without going through the matcher (e.g. direct RSC nav).
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </>
  );
}
