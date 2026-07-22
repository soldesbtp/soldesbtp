"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

const paysOrigine = [
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

export default function DeposerPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [suspendu, setSuspendu] = useState(false);
  const [valide, setValide] = useState(true);
  const [essaiExpire, setEssaiExpire] = useState(false);

  const [titre, setTitre] = useState("");
  const [ville, setVille] = useState("");
  const [collection, setCollection] = useState("");
  const [typeCarrelage, setTypeCarrelage] = useState("");
  const [marque, setMarque] = useState("");
  const [format, setFormat] = useState("");
  const [paysOrigineChoisi, setPaysOrigineChoisi] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixOriginal, setPrixOriginal] = useState("");
  const [prix, setPrix] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (!data.user) {
        setCheckingAuth(false);
        router.push("/connexion");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("suspendu, valide, acces_expire_le")
        .eq("id", data.user.id)
        .maybeSingle();

      setSuspendu(Boolean(profile?.suspendu));
      setValide(profile?.valide === true);
      setEssaiExpire(
        Boolean(
          profile?.acces_expire_le &&
            new Date(profile.acces_expire_le) < new Date()
        )
      );
      setCheckingAuth(false);
    });
  }, [supabase, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    let imageUrl: string | null = null;

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

      const { data } = supabase.storage
        .from("annonces")
        .getPublicUrl(filePath);
      imageUrl = data.publicUrl;
    }

    const { error: insertError } = await supabase.from("listings").insert({
      titre,
      ville,
      collection,
      type_carrelage: typeCarrelage || null,
      marque: marque || null,
      importateur: nomSociete,
      telephone,
      format,
      pays_origine: paysOrigineChoisi || null,
      quantite,
      prix_original: prixOriginal ? Number(prixOriginal) : null,
      prix: Number(prix),
      image_url: imageUrl,
      user_id: user.id,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center">
        <p className="font-body text-steel">Chargement...</p>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center px-6">
        <div className="stock-tag max-w-md text-center">
          <h1 className="font-display text-xl mb-3">ANNONCE PUBLIÉE</h1>
          <p className="font-body text-sm text-steel mb-4">
            Votre annonce est en ligne sur SoldesBTP.ma.
          </p>
          <button
            onClick={() => router.push("/")}
            className="font-body font-semibold px-6 py-3 bg-safety text-concrete rounded-sm hover:bg-safety-dark transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </main>
    );
  }

  if (suspendu) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center px-6">
        <div className="stock-tag max-w-md text-center">
          <h1 className="font-display text-xl mb-3 text-alert">
            COMPTE SUSPENDU
          </h1>
          <p className="font-body text-sm text-steel">
            Votre compte a été suspendu et ne peut plus déposer d&apos;annonce.
            Contactez SoldesBTP.ma pour plus d&apos;informations.
          </p>
        </div>
      </main>
    );
  }

  if (!valide) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center px-6">
        <div className="stock-tag max-w-md text-center">
          <h1 className="font-display text-xl mb-3">
            COMPTE EN COURS DE VALIDATION
          </h1>
          <p className="font-body text-sm text-steel">
            Votre inscription a bien été reçue. Notre équipe examine votre
            compte et vous pourrez déposer des annonces dès qu&apos;il sera
            validé.
          </p>
        </div>
      </main>
    );
  }

  if (essaiExpire) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center px-6">
        <div className="stock-tag max-w-md text-center">
          <h1 className="font-display text-xl mb-3 text-alert">
            PÉRIODE D&apos;ESSAI TERMINÉE
          </h1>
          <p className="font-body text-sm text-steel">
            Votre accès gratuit de 3 mois est arrivé à son terme. Contactez
            SoldesBTP.ma pour continuer à publier des annonces.
          </p>
        </div>
      </main>
    );
  }

  const typeOptions = collection ? typesParCollection[collection] : undefined;
  const formatOptions = collection ? formatsParCollection[collection] ?? [] : [];
  const nomSociete = (user?.user_metadata?.nom_societe as string) ?? "";
  const telephone = (user?.user_metadata?.telephone as string) ?? "";

  return (
    <main className="min-h-screen bg-cement px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto stock-tag flex flex-col gap-5"
      >
        <h1 className="font-display text-xl">DÉPOSER UNE ANNONCE</h1>

        <div className="bg-cement border border-concrete/15 rounded-sm px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="font-body text-xs text-steel uppercase tracking-wide">
              Vous postez en tant que
            </p>
            <p className="font-display text-sm">
              {nomSociete || "Société non renseignée"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/mes-annonces")}
            className="font-body text-xs px-3 py-2 border border-concrete/20 rounded-sm hover:border-safety hover:text-alert transition-colors"
          >
            Voir mes annonces
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex-1 font-body text-sm px-3 py-2 border border-concrete/20 rounded-sm hover:border-safety hover:text-alert transition-colors"
          >
            Retour à l'accueil
          </button>
          <button
            type="button"
            onClick={() => router.push("/profil")}
            className="flex-1 font-body text-sm px-3 py-2 border border-concrete/20 rounded-sm hover:border-safety hover:text-alert transition-colors"
          >
            Mon profil
          </button>
        </div>

        <div>
          <label className="font-body text-sm text-steel block mb-1">
            Titre de l'annonce
          </label>
          <input
            required
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Ex : Carrelage grès cérame 60x60 — lot importateur"
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
            <option value="">Sélectionner...</option>
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
            <option value="">Sélectionner...</option>
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

        {collection && (
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
        )}

        <div>
          <label className="font-body text-sm text-steel block mb-1">
            Pays d'origine
          </label>
          <select
            required
            value={paysOrigineChoisi}
            onChange={(e) => setPaysOrigineChoisi(e.target.value)}
            className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body bg-white"
          >
            <option value="">Sélectionner...</option>
            {paysOrigine.map((p) => (
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
            placeholder="Ex : 85 m²"
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
          {loading ? "Publication..." : "Publier l'annonce"}
        </button>
      </form>
    </main>
  );
}
