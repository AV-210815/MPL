import Link from "next/link";

interface Props { params: Promise<{ slug: string }> }

export default async function SlugUnauthorizedPage({ params }: Props) {
  const { slug } = await params;
  return (
    <div className="text-center py-20 space-y-4">
      <div className="text-6xl">🔒</div>
      <h1 className="text-2xl font-black text-white">Access Denied</h1>
      <p className="text-gray-500 text-sm">You don&apos;t have permission to view this page.</p>
      <Link href={`/${slug}`} className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-all text-sm">
        Back to Leaderboard
      </Link>
    </div>
  );
}
