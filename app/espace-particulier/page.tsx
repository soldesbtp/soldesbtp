"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase-browser";

const villes = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir"];

export default function EspaceParticulierPage() {
  const supabase = createClient();

  const [titre, setTitre] = useState("");
  const [ville, setVille] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prix, setPrix] = useState("");
  const [telephone, setTelephone] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let imageUrl: string | null = null;

    if (image) {
      const filePath = `particuliers/${Date.now()}-${image.name}`;
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

    const { error: insertError } = await supabase.from("listings").insert({
      titre,
      ville,
      collection: "Surplus de chantier",
      quantite,
      prix: Number(prix),
      telephone,
      image_url: imageUrl,
      user_id: null,
      valide: false,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="min-h-screen bg-cement">
      <Header />

      <section className="px-6 py-12">
        {success ? (
          <div className="stock-tag max-w-md mx-auto text-center">
            <h1 className="font-display text-xl mb-3">ANNONCE ENVOYÉE</h1>
            <p className="font-body text-sm text-steel">
              Votre annonce de surplus de chantier a bien été reçue. Elle
              sera visible sur SoldesBTP.ma dès qu&apos;elle aura été
              validée par notre équipe.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto stock-tag flex flex-col gap-5"
          >
            <h1 className="font-display text-xl">
              DÉPOSER MON SURPLUS DE CHANTIER
            </h1>
            <p className="font-body text-sm text-steel -mt-3">
              Vous avez un reste de matériaux après un chantier ? Postez-le
              ici, pas besoin de créer de compte.
            </p>

            <div>
              <label className="font-body text-sm text-steel block mb-1">
                Titre de l'annonce
              </label>
              <input
                required
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex : Reste de carrelage après chantier"
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
                Quantité restante
              </label>
              <input
                required
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                placeholder="Ex : 15 m²"
                className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body"
              />
            </div>

            <div>
              <label className="font-body text-sm text-steel block mb-1">
                Prix (DH)
              </label>
              <input
                required
                type="number"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-mono"
              />
            </div>

            <div>
              <label className="font-body text-sm text-steel block mb-1">
                Votre numéro de téléphone (WhatsApp)
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
                Photo (optionnel)
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
              {loading ? "Publication..." : "Publier mon annonce"}
            </button>
          </form>
        )}
      </section>

      <Footer />
    </main>
  );
}
