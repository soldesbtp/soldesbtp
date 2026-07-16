"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Building2, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFlow from "@/components/SearchFlow";

function RechercheContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ville = searchParams.get("ville");
  const mode = searchParams.get("mode") as "fournisseur" | "particulier" | null;

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

  if (mode === "fournisseur") {
    return (
      <main className="min-h-screen bg-cement">
        <Header />
        <SearchFlow ville={ville} />
        <Footer />
      </main>
    );
  }

  if (mode === "particulier") {
    router.push(`/annonces-particuliers?ville=${encodeURIComponent(ville)}`);
    return null;
  }

  return (
    <main className="min-h-screen bg-cement">
      <Header />
      <section className="bg-white border-b border-concrete/10">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <span className="font-mono text-xs text-steel px-2 py-1 bg-cement rounded-sm">
            {ville}
          </span>
          <h1 className="font-display text-2xl mt-4 mb-6">
            QUE RECHERCHEZ-VOUS ?
          </h1>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() =>
                router.push(
                  `/recherche?ville=${encodeURIComponent(ville)}&mode=fournisseur`
                )
              }
              className="flex items-center gap-2 font-body font-semibold px-6 py-4 bg-safety text-concrete rounded-sm hover:bg-safety-dark transition-colors"
            >
              <Building2 size={18} />
              Annonces fournisseur
            </button>
            <button
              onClick={() =>
                router.push(
                  `/recherche?ville=${encodeURIComponent(ville)}&mode=particulier`
                )
              }
              className="flex items-center gap-2 font-body font-semibold px-6 py-4 border border-concrete/20 rounded-sm hover:border-safety hover:text-alert transition-colors"
            >
              <Users size={18} />
              Annonces particulier
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default function RecherchePage() {
  return (
    <Suspense fallback={null}>
      <RechercheContent />
    </Suspense>
  );
}
