"use client";
import { usePathname } from "next/navigation";

export default function SlugMain({ slug, children }: { slug: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === `/${slug}/login` || pathname === `/${slug}/signup`;
  if (isAuthPage) return <>{children}</>;
  return <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">{children}</main>;
}
