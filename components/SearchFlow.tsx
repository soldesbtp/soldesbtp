"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Building2, Layers, Ruler } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import ListingCard, { Listing } from "@/components/ListingCard";

type Row = {
  id: string;
  titre: string;
  collection: string;
  importateur: string | null;
  telephone: string | null;
  format: string | null;
  ville: string;
  quantite: string | null;
  prix_original: number | null;
  prix: number;
  image_url: string | null;
  pays_origine: string | null;
  marque: string | null;
  user_id: string | null;
};

type Step = "fournisseur" | "collection" | "format" | "resultats";

function buildUrl(
  ville: string,
  fournisseur?: string | null,
  collection?: string | null,
  format?: string | null,
  tousFormats?: boolean
) {
  const params = new URLSearchParams();
  params.set("ville", ville);
  params.set("mode", "fournisseur");
  if (fournisseur) params.set("fournisseur", fournisseur);
  if (collection) params.set("collection", collection);
  if (format) params.set("format", format);
  if (tousFormats) params.set("tousFormats", "1");
  return `/recherche?${params.toString()}`;
}

export default function SearchFlow({ ville }: { ville: string }) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const fournisseur = searchParams.get("fournisseur");
  const collection = searchParams.get("collection");
  const format = searchParams.get("format");
  const tousFormats = searchParams.get("tousFormats") === "1";

  const [fournisseurs, setFournisseurs] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [resultats, setResultats] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [profil, setProfil] = useState<{
    photo_url: string | null;
    presentation: string | null;
  } | null>(null);

  const step: Step = !fournisseur
    ? "fournisseur"
    : !collection
    ? "collection"
    : !format && !tousFormats
    ? "format"
    : "resultats";

  const [fournisseursProfils, setFournisseursProfils] = useState<
    Record<string, { photo_url: string | null; presentation: string | null }>
  >({});

  useEffect(() => {
    if (!ville) return;
    setLoading(true);
    supabase
      .from("listings")
      .select("importateur, user_id")
      .eq("ville", ville)
      .then(async ({ data }) => {
        const rows = data ?? [];
        const uniques = Array.from(
          new Set(rows.map((r) => r.importateur).filter(Boolean))
        ) as string[];
        setFournisseurs(uniques);

        const userIdParNom: Record<string, string> = {};
        rows.forEach((r) => {
          if (r.importateur && r.user_id && !userIdParNom[r.importateur]) {
            userIdParNom[r.importateur] = r.user_id as string;
          }
        });

        const userIds = Array.from(new Set(Object.values(userIdParNom)));

        if (userIds.length > 0) {
          const { data: profils } = await supabase
            .from("profiles")
            .select("id, photo_url, presentation")
            .in("id", userIds);

          const parUserId: Record<
            string,
            { photo_url: string | null; presentation: string | null }
          > = {};
          (profils ?? []).forEach((p) => {
            parUserId[p.id as string] = {
              photo_url: p.photo_url as string | null,
              presentation: p.presentation as string | null,
            };
          });

          const map: Record<
            string,
            { photo_url: string | null; presentation: string | null }
          > = {};
          Object.entries(userIdParNom).forEach(([nom, userId]) => {
            if (parUserId[userId]) {
              map[nom] = parUserId[userId];
            }
          });
          setFournisseursProfils(map);
        }

        setLoading(false);
      });
  }, [supabase, ville]);

  useEffect(() => {
    if (!fournisseur) return;
    setLoading(true);
    supabase
      .from("listings")
      .select("collection")
      .eq("importateur", fournisseur)
      .eq("ville", ville)
      .then(({ data }) => {
        const uniques = Array.from(
          new Set((data ?? []).map((r) => r.collection).filter(Boolean))
        ) as string[];
        setCollections(uniques);
        setLoading(false);
      });
  }, [supabase, fournisseur, ville]);

  useEffect(() => {
    if (!fournisseur || !collection) return;
    setLoading(true);
    supabase
      .from("listings")
      .select("format")
      .eq("importateur", fournisseur)
      .eq("collection", collection)
      .eq("ville", ville)
      .then(({ data }) => {
        const uniques = Array.from(
          new Set((data ?? []).map((r) => r.format).filter(Boolean))
        ) as string[];
        setFormats(uniques);
        setLoading(false);
      });
  }, [supabase, fournisseur, collection, ville]);

  useEffect(() => {
    if (!fournisseur || !collection) return;
    if (!format && !tousFormats) return;
    setLoading(true);
    let query = supabase
      .from("listings")
      .select("*")
      .eq("importateur", fournisseur)
      .eq("collection", collection)
      .eq("ville", ville);
    if (format) {
      query = query.eq("format", format);
    }
    query.order("created_at", { ascending: false }).then(({ data }) => {
      setResultats((data ?? []) as Row[]);
      setLoading(false);
    });
  }, [supabase, fournisseur, collection, format, tousFormats, ville]);

  useEffect(() => {
    if (!fournisseur) {
      setProfil(null);
      return;
    }
    setProfil(fournisseursProfils[fournisseur] ?? null);
  }, [fournisseur, fournisseursProfils]);

  const listings: Listing[] = resultats.map((r) => ({
    id: r.id,
    title: r.titre,
    location: r.ville,
    quantity: r.quantite ?? "",
    originalPrice: r.prix_original,
    price: r.prix,
    category: r.collection,
    imageUrl: r.image_url,
    whatsapp: r.telephone,
    paysOrigine: r.pays_origine,
    marque: r.marque,
    fournisseurNom: r.importateur,
    fournisseurPhoto: fournisseur ? profil?.photo_url ?? null : null,
    userId: r.user_id,
  }));

  return (
    <section className="bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-center gap-2 mb-6 font-mono text-xs text-steel">
          <Link href="/" className="px-2 py-1 bg-cement rounded-sm hover:text-alert">
            {ville}
          </Link>
          {fournisseur && (
            <>
              <ChevronRight size={14} />
              <button
                onClick={() => router.push(buildUrl(ville, fournisseur))}
                className="px-2 py-1 bg-cement rounded-sm hover:text-alert"
              >
                {fournisseur}
              </button>
            </>
          )}
          {collection && (
            <>
              <ChevronRight size={14} />
              <button
                onClick={() =>
                  router.push(buildUrl(ville, fournisseur, collection))
                }
                className="px-2 py-1 bg-cement rounded-sm hover:text-alert"
              >
                {collection}
              </button>
            </>
          )}
          {format && (
            <>
              <ChevronRight size={14} />
              <span className="px-2 py-1 bg-safety/20 rounded-sm">{format}</span>
            </>
          )}
          {fournisseur && (
            <button
              onClick={() => router.push(buildUrl(ville))}
              className="ml-auto underline hover:text-alert"
            >
              Recommencer
            </button>
          )}
        </div>

        {loading && (
          <p className="font-body text-sm text-steel mb-4">Chargement...</p>
        )}

        {fournisseur && (profil?.photo_url || profil?.presentation) && (
          <div className="flex items-center gap-4 mb-8 bg-cement border border-concrete/15 rounded-sm p-4">
            {profil.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profil.photo_url}
                alt={fournisseur}
                className="w-16 h-16 rounded-full object-cover border-2 border-concrete flex-shrink-0"
              />
            )}
            <div>
              <p className="font-display text-sm">{fournisseur}</p>
              {profil.presentation && (
                <p className="font-body text-sm text-steel">
                  {profil.presentation}
                </p>
              )}
            </div>
          </div>
        )}

        {step === "fournisseur" && !loading && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={18} className="text-safety-dark" />
              <h2 className="font-display text-xl">QUEL FOURNISSEUR ?</h2>
            </div>
            {fournisseurs.length === 0 ? (
              <p className="font-body text-sm text-steel">
                Aucun fournisseur n&apos;a encore posté d&apos;annonce à {ville}.
              </p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {fournisseurs.map((f) => (
                  <button
                    key={f}
                    onClick={() => router.push(buildUrl(ville, f))}
                    className="flex flex-col items-center gap-2 group"
                  >
                    {fournisseursProfils[f]?.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fournisseursProfils[f].photo_url as string}
                        alt={f}
                        className="w-20 h-20 rounded-full object-cover border-2 border-concrete/15 group-hover:border-safety transition-colors"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-cement border-2 border-concrete/15 group-hover:border-safety transition-colors flex items-center justify-center">
                        <Building2 size={24} className="text-steel" />
                      </div>
                    )}
                    <span className="font-body text-sm group-hover:text-alert transition-colors">
                      {f}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === "collection" && !loading && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Layers size={18} className="text-safety-dark" />
              <h2 className="font-display text-xl">QUELLE COLLECTION ?</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {collections.map((c) => (
                <button
                  key={c}
                  onClick={() =>
                    router.push(buildUrl(ville, fournisseur, c))
                  }
                  className="font-body px-5 py-3 border border-concrete/15 rounded-sm hover:border-safety hover:text-alert transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "format" && !loading && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Ruler size={18} className="text-safety-dark" />
              <h2 className="font-display text-xl">QUEL FORMAT ?</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {formats.map((f) => (
                <button
                  key={f}
                  onClick={() =>
                    router.push(buildUrl(ville, fournisseur, collection, f))
                  }
                  className="font-mono px-5 py-3 border border-concrete/15 rounded-sm hover:border-safety hover:text-alert transition-colors"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "resultats" && !loading && (
          <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <h2 className="font-display text-xl">
                {listings.length} PRODUIT{listings.length > 1 ? "S" : ""} TROUVÉ
                {listings.length > 1 ? "S" : ""}
              </h2>
              <button
                onClick={() => router.push(buildUrl(ville, fournisseur))}
                className="font-body text-sm px-4 py-2 border border-concrete/20 rounded-sm hover:border-safety hover:text-alert transition-colors"
              >
                Voir les autres collections de {fournisseur}
              </button>
            </div>
            {listings.length === 0 ? (
              <p className="font-body text-sm text-steel">
                Aucun produit ne correspond à ces critères pour l&apos;instant.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
