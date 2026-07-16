"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function InscriptionPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nomSociete, setNomSociete] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nom_societe: nomSociete, telephone },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center px-6">
        <div className="stock-tag max-w-md text-center">
          <h1 className="font-display text-xl mb-3">VÉRIFIEZ VOS EMAILS</h1>
          <p className="font-body text-sm text-steel">
            On vous a envoyé un lien de confirmation à {email}. Cliquez
            dessus pour activer votre compte, puis connectez-vous.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cement flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="stock-tag w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="font-display text-xl">CRÉER UN COMPTE</h1>

        <div>
          <label className="font-body text-sm text-steel block mb-1">
            Nom de la société
          </label>
          <input
            required
            value={nomSociete}
            onChange={(e) => setNomSociete(e.target.value)}
            placeholder="Ex : Knight Trading"
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
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body"
          />
        </div>

        <div>
          <label className="font-body text-sm text-steel block mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body"
          />
        </div>

        {error && (
          <p className="font-body text-sm text-alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="font-body font-semibold px-6 py-3 bg-safety text-concrete rounded-sm hover:bg-safety-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/connexion")}
          className="font-body text-sm text-steel hover:text-alert"
        >
          Déjà un compte ? Se connecter
        </button>
      </form>
    </main>
  );
}
