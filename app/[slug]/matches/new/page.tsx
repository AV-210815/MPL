import { prisma } from "@/lib/db";
import { getApartmentOrNotFound } from "@/lib/apartment";
import MatchForm from "@/components/MatchForm";
import Link from "next/link";

interface Props { params: Promise<{ slug: string }> }

export default async function SlugNewMatchPage({ params }: Props) {
  const { slug } = await params;
  const apartment = await getApartmentOrNotFound(slug);
  const players = await prisma.player.findMany({ where: { apartmentId: apartment.id }, orderBy: { name: "asc" } });

  if (players.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-black text-white">Add Match</h1>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-yellow-300">
          You need to add players first before recording a match.{" "}
          <Link href={`/${slug}/players`} className="underline font-semibold">Go to Players →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-orange-500" />
        <h1 className="text-2xl font-black text-white">Add Match</h1>
      </div>
      <MatchForm players={players} redirectTo={`/${slug}/matches`} />
    </div>
  );
}
