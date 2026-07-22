"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard, { Listing } from "@/components/ListingCard";
import { createClient } from "@/lib/supabase-browser";

type Row = {
  id: string;
  titre: string;
  ville: string;
  quantite: string | null;
  prix_original: number | null;
  prix: number;
  image_url: string | null;
  telephone: string | null;
};

function AnnoncesParticuliersContent() {
  const searchParams = useSearchParams();
  const ville = searchParams.get("ville");
  const supabase = createClient();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ville) return;
    setLoading(true);
    supabase
      .from("listings")
      .select("*")
      .eq("collection", "Surplus de chantier")
      .eq("ville", ville)
      .eq("valide", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data ?? []) as Row[]);
        setLoading(false);
      });
  }, [supabase, ville]);

  if (!ville) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center px-6">
        <p className="font-body text-steel">
          Aucune ville sélectionnée.{" "}
          <a href="/" className="underline hover:text-alert">
            Retour à l&apos;accueil
          </a>
        </p>
      </main>
    );
  }

  const listings: Listing[] = rows.map((r) => ({
    id: r.id,
    title: r.titre,
    location: r.ville,
    quantity: r.quantite ?? "",
    originalPrice: r.prix_original,
    price: r.prix,
    category: "Surplus de chantier",
    imageUrl: r.image_url,
    whatsapp: r.telephone,
  }));

  return (
    <main className="min-h-screen bg-cement">
      <Header />
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-display text-2xl mb-6">
          ANNONCES DE PARTICULIERS À {ville.toUpperCase()}
        </h1>

        {loading ? (
          <p className="font-body text-sm text-steel">Chargement...</p>
        ) : listings.length === 0 ? (
          <p className="font-body text-sm text-steel">
            Aucune annonce de particulier pour l&apos;instant à {ville}.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}

export default function AnnoncesParticuliersPage() {
  return (
    <Suspense fallback={null}>
      <AnnoncesParticuliersContent />
    </Suspense>
  );
}
