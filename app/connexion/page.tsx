"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function ConnexionPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/deposer");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-cement flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="stock-tag w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="font-display text-xl">SE CONNECTER</h1>

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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body"
          />
        </div>

        {error && <p className="font-body text-sm text-alert">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="font-body font-semibold px-6 py-3 bg-safety text-concrete rounded-sm hover:bg-safety-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/inscription")}
          className="font-body text-sm text-steel hover:text-alert"
        >
          Pas encore de compte ? S'inscrire
        </button>
      </form>
    </main>
  );
}
