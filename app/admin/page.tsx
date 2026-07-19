"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

type Profile = {
  id: string;
  nom_societe: string | null;
  telephone: string | null;
  presentation: string | null;
  photo_url: string | null;
  est_admin: boolean;
  suspendu: boolean;
  valide: boolean;
  acces_expire_le: string | null;
};

type ListingRow = {
  id: string;
  titre: string;
  collection: string;
  ville: string;
  prix: number;
  user_id: string | null;
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [listings, setListings] = useState<ListingRow[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/connexion");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("est_admin")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!profile?.est_admin) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      setIsAdmin(true);
      await chargerDonnees();
      setChecking(false);
    });
  }, [supabase, router]);

  async function chargerDonnees() {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("valide", { ascending: true })
      .order("nom_societe", { ascending: true });
    setProfiles((profilesData ?? []) as Profile[]);

    const { data: listingsData } = await supabase
      .from("listings")
      .select("id, titre, collection, ville, prix, user_id")
      .order("created_at", { ascending: false });
    setListings((listingsData ?? []) as ListingRow[]);
  }

  async function toggleSuspension(profile: Profile) {
    await supabase
      .from("profiles")
      .update({ suspendu: !profile.suspendu })
      .eq("id", profile.id);
    chargerDonnees();
  }

  async function validerFournisseur(profile: Profile) {
    const dansTroisMois = new Date();
    dansTroisMois.setMonth(dansTroisMois.getMonth() + 3);

    await supabase
      .from("profiles")
      .update({ valide: true, acces_expire_le: dansTroisMois.toISOString() })
      .eq("id", profile.id);
    chargerDonnees();
  }

  async function activerAbonnementUnAn(profile: Profile) {
    const dansUnAn = new Date();
    dansUnAn.setFullYear(dansUnAn.getFullYear() + 1);

    await supabase
      .from("profiles")
      .update({ valide: true, acces_expire_le: dansUnAn.toISOString() })
      .eq("id", profile.id);
    chargerDonnees();
  }

  async function supprimerAnnonce(id: string) {
    if (!confirm("Supprimer définitivement cette annonce ?")) return;
    await supabase.from("listings").delete().eq("id", id);
    chargerDonnees();
  }

  async function supprimerCompte(profile: Profile) {
    if (
      !confirm(
        `Supprimer DÉFINITIVEMENT le compte "${profile.nom_societe}" et toutes ses annonces ? Cette action est irréversible.`
      )
    )
      return;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId: profile.id }),
    });

    if (!res.ok) {
      const body = await res.json();
      alert("Erreur : " + (body.error ?? "inconnue"));
      return;
    }

    chargerDonnees();
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center">
        <p className="font-body text-steel">Chargement...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center px-6">
        <p className="font-body text-steel">
          Cette page est réservée aux administrateurs.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cement px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="font-display text-2xl">ADMINISTRATION</h1>
          <button
            onClick={() => router.push("/")}
            className="font-body text-sm px-4 py-2 border border-concrete/20 rounded-sm hover:border-safety hover:text-alert transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>

        <h2 className="font-display text-lg mb-4">Fournisseurs</h2>
        <div className="mb-12 bg-white border border-concrete/15 rounded-sm overflow-hidden">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 p-4 border-b border-concrete/10 last:border-b-0 flex-wrap"
            >
              <div className="flex items-center gap-3">
                {p.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photo_url}
                    alt={p.nom_societe ?? ""}
                    className="w-10 h-10 rounded-full object-cover border border-concrete/15"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-cement border border-concrete/15" />
                )}
                <div>
                  <p className="font-body font-semibold text-sm">
                    {p.nom_societe || "(sans nom)"}
                    {p.est_admin && (
                      <span className="ml-2 font-mono text-xs text-safety-dark">
                        ADMIN
                      </span>
                    )}
                    {!p.est_admin && !p.valide && (
                      <span className="ml-2 font-mono text-xs text-alert">
                        EN ATTENTE DE VALIDATION
                      </span>
                    )}
                  </p>
                  <p className="font-mono text-xs text-steel">
                    {p.telephone}
                    {p.suspendu && (
                      <span className="ml-2 text-alert">· Suspendu</span>
                    )}
                    {!p.est_admin && p.valide && p.acces_expire_le && (
                      <span
                        className={
                          "ml-2 " +
                          (new Date(p.acces_expire_le) < new Date()
                            ? "text-alert"
                            : "")
                        }
                      >
                        ·{" "}
                        {new Date(p.acces_expire_le) < new Date()
                          ? "Essai gratuit expiré"
                          : `Accès jusqu'au ${new Date(
                              p.acces_expire_le
                            ).toLocaleDateString("fr-FR")}`}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {!p.est_admin && (
                <div className="flex gap-2">
                  {!p.valide && (
                    <button
                      onClick={() => validerFournisseur(p)}
                      className="font-body text-xs px-3 py-2 border border-safety bg-safety/10 text-safety-dark rounded-sm hover:bg-safety hover:text-concrete transition-colors"
                    >
                      Valider (accès 3 mois)
                    </button>
                  )}
                  {p.valide &&
                    p.acces_expire_le &&
                    new Date(p.acces_expire_le) < new Date() && (
                      <>
                        <button
                          onClick={() => validerFournisseur(p)}
                          className="font-body text-xs px-3 py-2 border border-safety bg-safety/10 text-safety-dark rounded-sm hover:bg-safety hover:text-concrete transition-colors"
                        >
                          Prolonger 3 mois
                        </button>
                        <button
                          onClick={() => activerAbonnementUnAn(p)}
                          className="font-body text-xs px-3 py-2 border border-concrete bg-concrete text-cement rounded-sm hover:bg-concrete-light transition-colors"
                        >
                          Abonnement payé (1 an)
                        </button>
                      </>
                    )}
                  <button
                    onClick={() => toggleSuspension(p)}
                    className="font-body text-xs px-3 py-2 border border-concrete/20 rounded-sm hover:border-safety hover:text-alert transition-colors"
                  >
                    {p.suspendu ? "Réactiver" : "Suspendre"}
                  </button>
                  <button
                    onClick={() => supprimerCompte(p)}
                    className="font-body text-xs px-3 py-2 border border-alert/40 text-alert rounded-sm hover:bg-alert hover:text-white transition-colors"
                  >
                    Supprimer le compte
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <h2 className="font-display text-lg mb-4">Toutes les annonces</h2>
        <div className="bg-white border border-concrete/15 rounded-sm overflow-hidden">
          {listings.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between gap-4 p-4 border-b border-concrete/10 last:border-b-0"
            >
              <div>
                <p className="font-body font-semibold text-sm">{l.titre}</p>
                <p className="font-mono text-xs text-steel">
                  {l.collection} · {l.ville} · {l.prix} DH
                </p>
              </div>
              <button
                onClick={() => supprimerAnnonce(l.id)}
                className="font-body text-xs px-3 py-2 border border-alert/40 text-alert rounded-sm hover:bg-alert hover:text-white transition-colors"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
