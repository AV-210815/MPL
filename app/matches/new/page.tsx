import MatchForm from "@/components/MatchForm";
import { prisma } from "@/lib/db";

export default async function NewMatchPage() {
  const players = await prisma.player.findMany({ orderBy: { name: "asc" } });

  if (players.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-black text-white">Add Match</h1>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-yellow-300">
          You need to add players first before recording a match.{" "}
          <a href="/players" className="underline font-semibold">Go to Players →</a>
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
      <MatchForm players={players} />
    </div>
  );
}
