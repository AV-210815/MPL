"use client";
import { usePathname } from "next/navigation";

export default function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/signup") return <>{children}</>;
  return (
    <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">{children}</main>
  );
}
