"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface Player { id: number; name: string; photo?: string | null }

const avatarColors = [
  "from-orange-500 to-red-600", "from-purple-500 to-violet-700",
  "from-blue-500 to-cyan-600", "from-green-500 to-emerald-600",
  "from-pink-500 to-rose-600", "from-amber-500 to-yellow-600",
];

function PlayerAvatar({ player, gradient }: { player: Player; gradient: string }) {
  if (player.photo) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-lg border border-white/10">
        <Image src={player.photo} alt={player.name} width={40} height={40} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-black text-white text-base shrink-0 shadow-lg`}
      style={{ fontFamily: "var(--font-bebas)" }}>
      {player.name[0].toUpperCase()}
    </div>
  );
}

export default function SlugPlayersPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploadId, setPendingUploadId] = useState<number | null>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d || d.slug !== slug) { router.push(`/${slug}/login`); return; }
        setAuthed(true);
      });
  }, [slug]);

  async function load() {
    const res = await fetch("/api/players");
    setPlayers(await res.json());
  }

  useEffect(() => { if (authed) load(); }, [authed]);

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (!res.ok) setError((await res.json()).error ?? "Failed to add player");
    else { setNewName(""); await load(); }
    setSaving(false);
  }

  async function deletePlayer(id: number, name: string) {
    if (!confirm(`Delete ${name}? This will also delete all their stats.`)) return;
    await fetch(`/api/players/${id}`, { method: "DELETE" });
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  async function saveEdit(id: number) {
    if (!editName.trim()) return;
    const res = await fetch(`/api/players/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    if (!res.ok) { alert((await res.json()).error ?? "Failed to update"); return; }
    setEditId(null);
    await load();
  }

  function triggerPhotoUpload(id: number) { setPendingUploadId(id); fileInputRef.current?.click(); }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || pendingUploadId === null) return;
    setUploadingId(pendingUploadId);
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch(`/api/players/${pendingUploadId}/photo`, { method: "POST", body: fd });
    if (!res.ok) alert((await res.json()).error ?? "Upload failed");
    else await load();
    setUploadingId(null);
    setPendingUploadId(null);
    e.target.value = "";
  }

  async function removePhoto(id: number) {
    await fetch(`/api/players/${id}/photo`, { method: "DELETE" });
    await load();
  }

  if (!authed) return <div className="text-center py-20 text-gray-600"><div className="text-4xl mb-3 animate-pulse">🔒</div><p>Checking auth…</p></div>;

  return (
    <div className="relative -mt-6 -mx-4 px-4 pt-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[320px] h-[320px] rounded-full bg-green-600/10 blur-[100px]" />
        <div className="absolute top-60 -left-10 w-[250px] h-[250px] rounded-full bg-teal-600/8 blur-[80px]" />
      </div>

      <div className="relative pt-10 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.25em] text-green-400 font-bold mb-1">Squad</p>
            <h1 className="text-[5rem] sm:text-[7rem] leading-none bg-gradient-to-br from-green-300 via-green-400 to-emerald-300 bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em", lineHeight: 1 }}>
              League<br /><span className="text-white">Players</span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm" style={{ fontFamily: "var(--font-rajdhani)", fontWeight: 600 }}>Manage league participants</p>
          </div>
          <div className="text-[7rem] sm:text-[9rem] leading-none select-none shrink-0 self-center opacity-35">👤</div>
        </div>
        <div className="mt-6 h-px bg-gradient-to-r from-green-500/50 via-green-500/20 to-transparent" />
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="relative max-w-xl space-y-4 pb-10">
        <form onSubmit={addPlayer} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <p className="font-black text-white text-sm uppercase tracking-wider" style={{ fontFamily: "var(--font-rajdhani)" }}>Add New Player</p>
          <div className="flex gap-2">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter player name…"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all" />
            <button type="submit" disabled={saving || !newName.trim()}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all">
              {saving ? "…" : "Add"}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        </form>

        {players.length > 0 && (
          <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold px-1">
            {players.length} player{players.length !== 1 ? "s" : ""} in the league
          </p>
        )}

        <div className="space-y-2">
          {players.length === 0 ? (
            <div className="text-center py-16 text-gray-600 border border-white/5 rounded-2xl bg-white/[0.02]">
              <div className="text-4xl mb-3">👤</div>
              <p className="font-semibold">No players yet.</p>
              <p className="text-sm mt-1">Add someone above to get started!</p>
            </div>
          ) : (
            players.map((p, idx) => {
              const grad = avatarColors[idx % avatarColors.length];
              const isUploading = uploadingId === p.id;
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/12 transition-all">
                  <div className="relative shrink-0 group/avatar">
                    <PlayerAvatar player={p} gradient={grad} />
                    <button onClick={() => triggerPhotoUpload(p.id)} disabled={isUploading}
                      className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer" title="Upload photo">
                      {isUploading ? <span className="text-white text-[10px] animate-pulse">…</span> : <span className="text-white text-sm">📷</span>}
                    </button>
                  </div>
                  {editId === p.id ? (
                    <>
                      <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(p.id); if (e.key === "Escape") setEditId(null); }}
                        className="flex-1 bg-white/8 border border-blue-500/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none" />
                      <button onClick={() => saveEdit(p.id)} className="text-xs text-green-400 hover:text-green-300 font-bold px-2">Save</button>
                      <button onClick={() => setEditId(null)} className="text-xs text-gray-600 hover:text-gray-400 px-2">Cancel</button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-semibold block truncate" style={{ fontFamily: "var(--font-rajdhani)", fontSize: "1.05rem" }}>{p.name}</span>
                        {p.photo && <button onClick={() => removePhoto(p.id)} className="text-[10px] text-gray-600 hover:text-red-400 transition-colors">Remove photo</button>}
                      </div>
                      <button onClick={() => { setEditId(p.id); setEditName(p.name); }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2.5 py-1.5 rounded-lg hover:bg-blue-500/10 transition-all">
                        Rename
                      </button>
                      <button onClick={() => deletePlayer(p.id, p.name)}
                        className="text-xs text-red-400 hover:text-red-300 font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-all">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
