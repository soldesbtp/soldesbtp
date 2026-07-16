"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

const MAX_PRESENTATION = 300;

export default function ProfilPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [estAdmin, setEstAdmin] = useState(false);

  const [nomSociete, setNomSociete] = useState("");
  const [telephone, setTelephone] = useState("");
  const [presentation, setPresentation] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      setNomSociete((data.user?.user_metadata?.nom_societe as string) ?? "");
      setTelephone((data.user?.user_metadata?.telephone as string) ?? "");
      setPresentation((data.user?.user_metadata?.presentation as string) ?? "");
      setPhotoUrl((data.user?.user_metadata?.photo_url as string) ?? null);

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("est_admin")
          .eq("id", data.user.id)
          .maybeSingle();
        setEstAdmin(Boolean(profile?.est_admin));
      }

      setCheckingAuth(false);
      if (!data.user) {
        router.push("/connexion");
      }
    });
  }, [supabase, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    let newPhotoUrl = photoUrl;

    if (photoFile) {
      const filePath = `profils/${user.id}/${Date.now()}-${photoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("annonces")
        .upload(filePath, photoFile);

      if (uploadError) {
        setError("Erreur à l'envoi de la photo : " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage.from("annonces").getPublicUrl(filePath);
      newPhotoUrl = data.publicUrl;
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        nom_societe: nomSociete,
        telephone,
        presentation,
        photo_url: newPhotoUrl,
      },
    });

    if (!error) {
      await supabase.from("profiles").upsert({
        id: user.id,
        nom_societe: nomSociete,
        telephone,
        presentation,
        photo_url: newPhotoUrl,
        updated_at: new Date().toISOString(),
      });
    }

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setPhotoUrl(newPhotoUrl);
    setSuccess(true);
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center">
        <p className="font-body text-steel">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cement flex items-center justify-center px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="stock-tag w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="font-display text-xl">MODIFIER MON PROFIL</h1>

        <p className="font-body text-xs text-steel">{user?.email}</p>

        <div>
          <label className="font-body text-sm text-steel block mb-1">
            Photo de profil
          </label>
          <div className="flex items-center gap-4">
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt="Photo de profil"
                className="w-16 h-16 rounded-full object-cover border-2 border-concrete"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="font-body text-sm"
            />
          </div>
        </div>

        <div>
          <label className="font-body text-sm text-steel block mb-1">
            Nom de la société
          </label>
          <input
            required
            value={nomSociete}
            onChange={(e) => setNomSociete(e.target.value)}
            className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body"
          />
        </div>

        <div>
          <label className="font-body text-sm text-steel block mb-1">
            Téléphone WhatsApp
          </label>
          <input
            required
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="Ex : 0612345678"
            className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body"
          />
        </div>

        <div>
          <label className="font-body text-sm text-steel block mb-1">
            Présentation ({presentation.length}/{MAX_PRESENTATION})
          </label>
          <textarea
            value={presentation}
            onChange={(e) =>
              setPresentation(e.target.value.slice(0, MAX_PRESENTATION))
            }
            maxLength={MAX_PRESENTATION}
            rows={4}
            placeholder="Présentez votre société en quelques lignes..."
            className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body resize-none"
          />
        </div>

        {error && <p className="font-body text-sm text-alert">{error}</p>}
        {success && (
          <p className="font-body text-sm text-safety-dark">
            Profil mis à jour avec succès.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="font-body font-semibold px-6 py-3 bg-safety text-concrete rounded-sm hover:bg-safety-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>

        {estAdmin && (
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="font-body font-semibold px-6 py-3 bg-concrete text-cement rounded-sm hover:bg-concrete-light transition-colors"
          >
            Accéder à l'administration
          </button>
        )}

        <button
          type="button"
          onClick={() => router.push("/deposer")}
          className="font-body font-semibold px-6 py-3 border border-concrete/20 rounded-sm hover:border-safety hover:text-alert transition-colors"
        >
          + Déposer une nouvelle annonce
        </button>

        <button
          type="button"
          onClick={() => router.push("/mes-annonces")}
          className="font-body text-sm text-steel hover:text-alert"
        >
          Retour au dépôt d'annonce
        </button>
      </form>
    </main>
  );
}
