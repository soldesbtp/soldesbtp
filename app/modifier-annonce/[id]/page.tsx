"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

const villes = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir"];

const collections = [
  "Carrelage",
  "Parquets",
  "Sanitaire",
  "Accessoires salle de bain",
  "Baignoires",
  "Électricité",
  "Plomberie",
  "Coffrage",
];

const formatsParCollection: Record<string, string[]> = {
  Carrelage: ["Hexagonal", "22.5x22.5", "40x40", "33x100", "120x120", "120x260", "30x90", "Effet pierre"],
  Parquets: ["Chêne clair", "Chêne foncé", "Gris cendré"],
  Sanitaire: ["Vasque à poser", "Vasque encastrée", "WC suspendu", "WC au sol"],
  "Accessoires salle de bain": ["Porte-serviette", "Miroir", "Meuble vasque"],
  Baignoires: ["Îlot", "Angle", "Rectangulaire"],
  Électricité: ["Câble 3G1.5", "Câble 3G2.5", "Disjoncteurs", "Prises"],
  Plomberie: ["PVC Ø32", "PVC Ø110", "Raccords", "Robinetterie"],
  Coffrage: ["Panneaux bois", "Étais", "Banches métalliques"],
};

const typesParCollection: Record<string, string[] | undefined> = {
  Carrelage: ["Importation", "Local"],
};

const paysOrigineListe = [
  "Maroc",
  "Espagne",
  "Italie",
  "Turquie",
  "Portugal",
  "France",
  "Chine",
  "Inde",
  "Égypte",
];

export default function ModifierAnnoncePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [titre, setTitre] = useState("");
  const [ville, setVille] = useState("");
  const [collection, setCollection] = useState("");
  const [typeCarrelage, setTypeCarrelage] = useState("");
  const [marque, setMarque] = useState("");
  const [format, setFormat] = useState("");
  const [paysOrigine, setPaysOrigine] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixOriginal, setPrixOriginal] = useState("");
  const [prix, setPrix] = useState("");
  const [imageActuelle, setImageActuelle] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/connexion");
        return;
      }
      setUser(data.user);

      const { data: listing, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (error || !listing) {
        setNotFound(true);
        setChecking(false);
        return;
      }

      setTitre(listing.titre ?? "");
      setVille(listing.ville ?? "");
      setCollection(listing.collection ?? "");
      setTypeCarrelage(listing.type_carrelage ?? "");
      setMarque(listing.marque ?? "");
      setFormat(listing.format ?? "");
      setPaysOrigine(listing.pays_origine ?? "");
      setQuantite(listing.quantite ?? "");
      setPrixOriginal(listing.prix_original?.toString() ?? "");
      setPrix(listing.prix?.toString() ?? "");
      setImageActuelle(listing.image_url ?? null);
      setChecking(false);
    });
  }, [supabase, router, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    let imageUrl = imageActuelle;

    if (image) {
      const filePath = `${user.id}/${Date.now()}-${image.name}`;
      const { error: uploadError } = await supabase.storage
        .from("annonces")
        .upload(filePath, image);

      if (uploadError) {
        setError("Erreur à l'envoi de la photo : " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage.from("annonces").getPublicUrl(filePath);
      imageUrl = data.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("listings")
      .update({
        titre,
        ville,
        collection,
        type_carrelage: typeCarrelage || null,
        marque: marque || null,
        format,
        pays_origine: paysOrigine || null,
        quantite,
        prix_original: prixOriginal ? Number(prixOriginal) : null,
        prix: Number(prix),
        image_url: imageUrl,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center">
        <p className="font-body text-steel">Chargement...</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center px-6">
        <p className="font-body text-steel">
          Cette annonce n&apos;existe pas ou ne vous appartient pas.
        </p>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center px-6">
        <div className="stock-tag max-w-md text-center">
          <h1 className="font-display text-xl mb-3">ANNONCE MISE À JOUR</h1>
          <button
            onClick={() => router.push("/mes-annonces")}
            className="font-body font-semibold px-6 py-3 bg-safety text-concrete rounded-sm hover:bg-safety-dark transition-colors"
          >
            Retour à mes annonces
          </button>
        </div>
      </main>
    );
  }

  const typeOptions = collection ? typesParCollection[collection] : undefined;
  const formatOptions = collection ? formatsParCollection[collection] ?? [] : [];

  return (
    <main className="min-h-screen bg-cement">
      <Header />
      <section className="px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto stock-tag flex flex-col gap-5"
        >
          <h1 className="font-display text-xl">MODIFIER L&apos;ANNONCE</h1>

          <div>
            <label className="font-body text-sm text-steel block mb-1">
              Titre de l&apos;annonce
            </label>
            <input
              required
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body"
            />
          </div>

          <div>
            <label className="font-body text-sm text-steel block mb-1">
              Ville
            </label>
            <select
              required
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body bg-white"
            >
              {villes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-body text-sm text-steel block mb-1">
              Collection
            </label>
            <select
              required
              value={collection}
              onChange={(e) => {
                setCollection(e.target.value);
                setTypeCarrelage("");
                setMarque("");
                setFormat("");
              }}
              className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body bg-white"
            >
              {collections.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {typeOptions && (
            <div>
              <label className="font-body text-sm text-steel block mb-1">
                Importation ou local ?
              </label>
              <select
                required
                value={typeCarrelage}
                onChange={(e) => setTypeCarrelage(e.target.value)}
                className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body bg-white"
              >
                <option value="">Sélectionner...</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {collection && (
            <div>
              <label className="font-body text-sm text-steel block mb-1">
                Marque
              </label>
              <input
                value={marque}
                onChange={(e) => setMarque(e.target.value)}
                placeholder="Ex : Bestile, Huida..."
                className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body"
              />
            </div>
          )}

          <div>
            <label className="font-body text-sm text-steel block mb-1">
              Format
            </label>
            <select
              required
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body bg-white"
            >
              <option value="">Sélectionner...</option>
              {formatOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-body text-sm text-steel block mb-1">
              Pays d'origine
            </label>
            <select
              required
              value={paysOrigine}
              onChange={(e) => setPaysOrigine(e.target.value)}
              className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body bg-white"
            >
              <option value="">Sélectionner...</option>
              {paysOrigineListe.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-body text-sm text-steel block mb-1">
              Quantité restante
            </label>
            <input
              required
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm text-steel block mb-1">
                Prix original (DH)
              </label>
              <input
                type="number"
                value={prixOriginal}
                onChange={(e) => setPrixOriginal(e.target.value)}
                className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="font-body text-sm text-steel block mb-1">
                Prix soldé (DH)
              </label>
              <input
                required
                type="number"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-body text-sm text-steel block mb-1">
              Photo du produit
            </label>
            {imageActuelle && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageActuelle}
                alt={titre}
                className="w-24 h-24 object-contain border border-concrete/15 rounded-sm mb-2 bg-white"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="w-full font-body text-sm"
            />
          </div>

          {error && <p className="font-body text-sm text-alert">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="font-body font-semibold px-6 py-3 bg-safety text-concrete rounded-sm hover:bg-safety-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/mes-annonces")}
            className="font-body text-sm text-steel hover:text-alert"
          >
            Annuler
          </button>
        </form>
      </section>
      <Footer />
    </main>
  );
}
