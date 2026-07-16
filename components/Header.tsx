"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleDeconnexion() {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const nomSociete = (user?.user_metadata?.nom_societe as string) ?? "";
  const photoUrl = (user?.user_metadata?.photo_url as string) ?? null;

  return (
    <header className="bg-concrete text-cement sticky top-0 z-50 border-b-4 border-safety">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="SoldesBTP.ma"
            width={44}
            height={44}
            className="rounded-full"
          />
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg tracking-tight">
              SOLDES<span className="text-safety">BTP</span>
              <span className="font-mono text-xs text-steel">.ma</span>
            </span>
            <span className="font-body text-[10px] text-cement/50 uppercase tracking-wide mt-0.5">
              La place de marché du BTP
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-body text-sm">
          <Link href="/qui-sommes-nous" className="hover:text-safety transition-colors">
            Qui sommes-nous
          </Link>
          <Link href="/espace-particulier" className="hover:text-safety transition-colors">
            Espace particulier
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 px-2 py-1.5 pr-3 border border-safety/40 bg-safety/10 rounded-full hover:bg-safety/20 transition-colors"
              >
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt={nomSociete}
                    className="w-8 h-8 rounded-full object-cover border-2 border-safety"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-safety/30 border-2 border-safety flex items-center justify-center">
                    <Building2 size={16} className="text-safety" />
                  </div>
                )}
                <span className="font-body text-sm max-w-[140px] truncate">
                  {nomSociete || "Connecté"}
                </span>
                <ChevronDown size={14} />
              </button>

              {open && (
                <div className="absolute right-0 top-full mt-2 bg-white text-concrete border border-concrete/15 rounded-sm shadow-lg z-10 min-w-[200px] overflow-hidden">
                  <Link
                    href="/mes-annonces"
                    onClick={() => setOpen(false)}
                    className="block font-body text-sm px-4 py-3 hover:bg-cement hover:text-alert transition-colors"
                  >
                    Mes annonces
                  </Link>
                  <Link
                    href="/profil"
                    onClick={() => setOpen(false)}
                    className="block font-body text-sm px-4 py-3 hover:bg-cement hover:text-alert transition-colors"
                  >
                    Mon profil
                  </Link>
                  <Link
                    href="/deposer"
                    onClick={() => setOpen(false)}
                    className="block font-body text-sm px-4 py-3 hover:bg-cement hover:text-alert transition-colors"
                  >
                    Déposer une annonce
                  </Link>
                  <button
                    onClick={handleDeconnexion}
                    className="w-full text-left font-body text-sm px-4 py-3 text-alert hover:bg-cement transition-colors border-t border-concrete/10"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/connexion"
              className="font-body text-sm px-4 py-2 border border-cement/30 rounded-sm hover:border-safety hover:text-safety transition-colors"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
