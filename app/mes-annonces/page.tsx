"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard, { Listing } from "@/components/ListingCard";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

type Row = {
  id: string;
  titre: string;
  collection: string;
  ville: string;
  quantite: string | null;
  prix_original: number | null;
  prix: number;
  image_url: string | null;
  telephone: string | null;
  pays_origine: string | null;
};

export default function MesAnnoncesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/connexion");
        return;
      }
      // Rafraîchit la session pour être sûr d'avoir les dernières
      // métadonnées (photo, présentation) même si mises à jour ailleurs.
      const { data: refreshed } = await supabase.auth.refreshSession();
      setUser(refreshed.user ?? data.user);

      supabase
        .from("listings")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .then(({ data: listingsData }) => {
          setRows((listingsData ?? []) as Row[]);
          setLoading(false);
        });
    });
  }, [supabase, router]);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer définitivement cette annonce ?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (!error) {
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  }

  const parCollection = rows.reduce<Record<string, Row[]>>((acc, row) => {
    acc[row.collection] = acc[row.collection] ?? [];
    acc[row.collection].push(row);
    return acc;
  }, {});

  const nomSociete = (user?.user_metadata?.nom_societe as string) ?? "";
  const photoUrl = (user?.user_metadata?.photo_url as string) ?? null;
  const presentation = (user?.user_metadata?.presentation as string) ?? "";

  return (
    <main className="min-h-screen bg-cement">
      <Header />

      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="font-display text-2xl">
            MES ANNONCES {nomSociete && `— ${nomSociete.toUpperCase()}`}
          </h1>
          <button
            onClick={() => router.push("/deposer")}
            className="font-body font-semibold px-5 py-3 bg-safety text-concrete rounded-sm hover:bg-safety-dark transition-colors"
          >
            + Déposer une nouvelle annonce
          </button>
        </div>

        {(photoUrl || presentation) && (
          <div className="flex items-center gap-4 mb-8 bg-white border border-concrete/15 rounded-sm p-4">
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt={nomSociete}
                className="w-16 h-16 rounded-full object-cover border-2 border-concrete flex-shrink-0"
              />
            )}
            {presentation && (
              <p className="font-body text-sm text-steel">{presentation}</p>
            )}
          </div>
        )}

        {loading ? (
          <p className="font-body text-sm text-steel">Chargement...</p>
        ) : rows.length === 0 ? (
          <p className="font-body text-sm text-steel">
            Vous n&apos;avez pas encore posté d&apos;annonce.
          </p>
        ) : (
          Object.entries(parCollection).map(([collection, items]) => {
            const listings: Listing[] = items.map((r) => ({
              id: r.id,
              title: r.titre,
              location: r.ville,
              quantity: r.quantite ?? "",
              originalPrice: r.prix_original,
              price: r.prix,
              category: r.collection,
              imageUrl: r.image_url,
              whatsapp: undefined,
              paysOrigine: r.pays_origine,
            }));

            return (
              <div key={collection} className="mb-10">
                <h2 className="font-display text-lg mb-4">
                  {collection.toUpperCase()}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      editHref={`/modifier-annonce/${listing.id}`}
                      onDelete={() => handleDelete(listing.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      <Footer />
    </main>
  );
}
