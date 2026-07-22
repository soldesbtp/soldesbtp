"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

type Profile = {
  id: string;
  nom_societe: string | null;
  telephone: string | null;
  presentation: string | null;
  photo_url: string | null;
  est_admin: boolean;
  suspendu: boolean;
  valide: boolean;
  acces_expire_le: string | null;
};

type ListingRow = {
  id: string;
  titre: string;
  collection: string;
  ville: string;
  prix: number;
  user_id: string | null;
};

type AnnonceParticulierRow = {
  id: string;
  titre: string;
  ville: string;
  quantite: string | null;
  prix: number;
  telephone: string | null;
  image_url: string | null;
};

function whatsappLien(phone: string, message: string) {
  const digits = phone.replace(/[^0-9]/g, "");
  const international = digits.startsWith("0") ? "212" + digits.slice(1) : digits;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}

function whatsappLinkFournisseur(phone: string, nomSociete: string) {
  return whatsappLien(
    phone,
    `Bonjour ${nomSociete}, votre inscription sur SoldesBTP.ma a été validée ! Vous pouvez dès à présent déposer vos annonces depuis votre espace fournisseur.`
  );
}

function whatsappLinkPresentation(phone: string, nomSociete: string) {
  return whatsappLien(
    phone,
    `Bonjour ${nomSociete}, pour finaliser la validation de votre compte sur SoldesBTP.ma, pourriez-vous nous présenter votre société (activité, produits vendus, années d'expérience) ? Merci !`
  );
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [annoncesParticuliers, setAnnoncesParticuliers] = useState<
    AnnonceParticulierRow[]
  >([]);

  const [nouveauxEmails, setNouveauxEmails] = useState<Record<string, string>>({});
  const [emailEnCours, setEmailEnCours] = useState<string | null>(null);

  const [contactsParFournisseur, setContactsParFournisseur] = useState<
    Record<string, number>
  >({});
  const [contactsParListing, setContactsParListing] = useState<
    Record<string, number>
  >({});
  const [detailOuvert, setDetailOuvert] = useState<Record<string, boolean>>({});

  const [psTitre, setPsTitre] = useState("");
  const [psDescription, setPsDescription] = useState("");
  const [psPrix, setPsPrix] = useState("");
  const [psWhatsapp, setPsWhatsapp] = useState("");
  const [psImage1, setPsImage1] = useState<string | null>(null);
  const [psImage2, setPsImage2] = useState<string | null>(null);
  const [psImage3, setPsImage3] = useState<string | null>(null);
  const [psFile1, setPsFile1] = useState<File | null>(null);
  const [psFile2, setPsFile2] = useState<File | null>(null);
  const [psFile3, setPsFile3] = useState<File | null>(null);
  const [psMessage, setPsMessage] = useState("");
  const [psImageBarree, setPsImageBarree] = useState<string | null>(null);
  const [psFileBarree, setPsFileBarree] = useState<File | null>(null);
  const [psLoading, setPsLoading] = useState(false);
  const [psSuccess, setPsSuccess] = useState(false);
  const [psError, setPsError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/connexion");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("est_admin")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!profile?.est_admin) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      setIsAdmin(true);
      await chargerDonnees();
      setChecking(false);
    });
  }, [supabase, router]);

  async function chargerDonnees() {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("valide", { ascending: true })
      .order("nom_societe", { ascending: true });
    setProfiles((profilesData ?? []) as Profile[]);

    const { data: listingsData } = await supabase
      .from("listings")
      .select("id, titre, collection, ville, prix, user_id")
      .order("created_at", { ascending: false });
    setListings((listingsData ?? []) as ListingRow[]);

    const { data: annoncesParticuliersData } = await supabase
      .from("listings")
      .select("id, titre, ville, quantite, prix, telephone, image_url")
      .eq("collection", "Surplus de chantier")
      .eq("valide", false)
      .order("created_at", { ascending: false });
    setAnnoncesParticuliers(
      (annoncesParticuliersData ?? []) as AnnonceParticulierRow[]
    );

    const { data: contactsData } = await supabase
      .from("contacts_whatsapp")
      .select("user_id, listing_id");
    const compteParFournisseur: Record<string, number> = {};
    const compteParListing: Record<string, number> = {};
    (contactsData ?? []).forEach((c) => {
      if (c.user_id) {
        compteParFournisseur[c.user_id] = (compteParFournisseur[c.user_id] ?? 0) + 1;
      }
      if (c.listing_id) {
        compteParListing[c.listing_id] = (compteParListing[c.listing_id] ?? 0) + 1;
      }
    });
    setContactsParFournisseur(compteParFournisseur);
    setContactsParListing(compteParListing);

    const { data: produitStar } = await supabase
      .from("produit_star")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (produitStar) {
      setPsTitre(produitStar.titre ?? "");
      setPsDescription(produitStar.description ?? "");
      setPsPrix(produitStar.prix !== null ? String(produitStar.prix) : "");
      setPsWhatsapp(produitStar.whatsapp ?? "");
      setPsImage1(produitStar.image_url_1 ?? null);
      setPsImage2(produitStar.image_url_2 ?? null);
      setPsImage3(produitStar.image_url_3 ?? null);
      setPsMessage(produitStar.message_accrocheur ?? "");
      setPsImageBarree(produitStar.image_barree_url ?? null);
    }
  }

  async function enregistrerProduitStar(e: React.FormEvent) {
    e.preventDefault();
    setPsLoading(true);
    setPsError(null);
    setPsSuccess(false);

    async function uploadSiBesoin(file: File | null, urlActuelle: string | null) {
      if (!file) return urlActuelle;
      const filePath = `produit-star/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("annonces")
        .upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from("annonces").getPublicUrl(filePath);
      return data.publicUrl;
    }

    try {
      const url1 = await uploadSiBesoin(psFile1, psImage1);
      const url2 = await uploadSiBesoin(psFile2, psImage2);
      const url3 = await uploadSiBesoin(psFile3, psImage3);
      const urlBarree = await uploadSiBesoin(psFileBarree, psImageBarree);

      const { error } = await supabase.from("produit_star").upsert({
        id: 1,
        titre: psTitre,
        description: psDescription,
        prix: psPrix ? Number(psPrix) : null,
        image_url_1: url1,
        image_url_2: url2,
        image_url_3: url3,
        whatsapp: psWhatsapp,
        message_accrocheur: psMessage,
        image_barree_url: urlBarree,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setPsImage1(url1);
      setPsImage2(url2);
      setPsImage3(url3);
      setPsImageBarree(urlBarree);
      setPsFile1(null);
      setPsFile2(null);
      setPsFile3(null);
      setPsFileBarree(null);
      setPsSuccess(true);
    } catch (err) {
      setPsError(err instanceof Error ? err.message : "Erreur inconnue");
    }

    setPsLoading(false);
  }

  async function toggleSuspension(profile: Profile) {
    await supabase
      .from("profiles")
      .update({ suspendu: !profile.suspendu })
      .eq("id", profile.id);
    chargerDonnees();
  }

  async function notifierFournisseurValide(profile: Profile) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    await fetch("/api/admin/notify-fournisseur-valide", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        targetUserId: profile.id,
        nomSociete: profile.nom_societe,
      }),
    }).catch(() => {});
  }

  async function validerFournisseur(profile: Profile) {
    const premiereValidation = !profile.valide;
    const dansTroisMois = new Date();
    dansTroisMois.setMonth(dansTroisMois.getMonth() + 3);

    await supabase
      .from("profiles")
      .update({ valide: true, acces_expire_le: dansTroisMois.toISOString() })
      .eq("id", profile.id);

    if (premiereValidation) {
      await notifierFournisseurValide(profile);
    }

    chargerDonnees();
  }

  async function activerAbonnementUnAn(profile: Profile) {
    const dansUnAn = new Date();
    dansUnAn.setFullYear(dansUnAn.getFullYear() + 1);

    await supabase
      .from("profiles")
      .update({ valide: true, acces_expire_le: dansUnAn.toISOString() })
      .eq("id", profile.id);
    chargerDonnees();
  }

  async function changerEmail(profile: Profile) {
    const newEmail = nouveauxEmails[profile.id];
    if (!newEmail) return;

    setEmailEnCours(profile.id);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch("/api/admin/update-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId: profile.id, newEmail }),
    });

    setEmailEnCours(null);

    if (!res.ok) {
      const body = await res.json();
      alert("Erreur : " + (body.error ?? "inconnue"));
      return;
    }

    setNouveauxEmails((prev) => ({ ...prev, [profile.id]: "" }));
    alert(`Email changé pour "${profile.nom_societe}".`);
  }

  async function actionSurAnnonce(action: "delete" | "valider", listingId: string) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch("/api/admin/listing-action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action, listingId }),
    });

    if (!res.ok) {
      const body = await res.json();
      alert("Erreur : " + (body.error ?? "inconnue"));
      return;
    }

    chargerDonnees();
  }

  async function supprimerAnnonce(id: string) {
    if (!confirm("Supprimer définitivement cette annonce ?")) return;
    await actionSurAnnonce("delete", id);
  }

  async function validerAnnonceParticulier(id: string) {
    await actionSurAnnonce("valider", id);
  }

  async function refuserAnnonceParticulier(id: string) {
    if (!confirm("Refuser et supprimer définitivement cette annonce ?")) return;
    await actionSurAnnonce("delete", id);
  }

  async function supprimerCompte(profile: Profile) {
    if (
      !confirm(
        `Supprimer DÉFINITIVEMENT le compte "${profile.nom_societe}" et toutes ses annonces ? Cette action est irréversible.`
      )
    )
      return;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId: profile.id }),
    });

    if (!res.ok) {
      const body = await res.json();
      alert("Erreur : " + (body.error ?? "inconnue"));
      return;
    }

    chargerDonnees();
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center">
        <p className="font-body text-steel">Chargement...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-cement flex items-center justify-center px-6">
        <p className="font-body text-steel">
          Cette page est réservée aux administrateurs.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cement px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="font-display text-2xl">ADMINISTRATION</h1>
          <button
            onClick={() => router.push("/")}
            className="font-body text-sm px-4 py-2 border border-concrete/20 rounded-sm hover:border-safety hover:text-alert transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>

        <h2 className="font-display text-lg mb-4">Produit star</h2>
        <form
          onSubmit={enregistrerProduitStar}
          className="mb-12 bg-white border border-concrete/15 rounded-sm p-4 flex flex-col gap-4"
        >
          <p className="font-body text-sm text-steel">
            Ce produit reste toujours affiché en premier sur la page
            d&apos;accueil, contrairement aux autres annonces qui changent.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { file: psFile1, setFile: setPsFile1, image: psImage1, label: "Image 1" },
              { file: psFile2, setFile: setPsFile2, image: psImage2, label: "Image 2" },
              { file: psFile3, setFile: setPsFile3, image: psImage3, label: "Image 3" },
            ].map((slot, i) => (
              <div key={i}>
                <label className="font-body text-sm text-steel block mb-1">
                  {slot.label}
                </label>
                {slot.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slot.image}
                    alt={slot.label}
                    className="w-full h-32 object-contain bg-cement border border-concrete/15 rounded-sm mb-2"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => slot.setFile(e.target.files?.[0] ?? null)}
                  className="w-full font-body text-xs"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="font-body text-sm text-steel block mb-1">
              Titre du produit
            </label>
            <input
              value={psTitre}
              onChange={(e) => setPsTitre(e.target.value)}
              className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body"
            />
          </div>

          <div>
            <label className="font-body text-sm text-steel block mb-1">
              Description
            </label>
            <textarea
              value={psDescription}
              onChange={(e) => setPsDescription(e.target.value)}
              rows={4}
              className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body resize-none"
            />
          </div>

          <div className="border border-concrete/15 rounded-sm p-3 bg-cement">
            <label className="font-body text-sm text-steel block mb-1">
              Message accrocheur (ex : &quot;LA SOLUTION QUI REMPLACE LE
              BITUME&quot;)
            </label>
            <input
              value={psMessage}
              onChange={(e) => setPsMessage(e.target.value)}
              placeholder="Ex : La solution qui remplace le bitume"
              className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body mb-3"
            />

            <label className="font-body text-sm text-steel block mb-1">
              Image à barrer d&apos;une croix rouge (ex : photo de bitume)
            </label>
            {psImageBarree && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={psImageBarree}
                alt="Image barrée"
                className="w-20 h-20 object-cover bg-white border border-concrete/15 rounded-sm mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPsFileBarree(e.target.files?.[0] ?? null)}
              className="w-full font-body text-xs"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm text-steel block mb-1">
                Prix (DH)
              </label>
              <input
                type="number"
                value={psPrix}
                onChange={(e) => setPsPrix(e.target.value)}
                className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="font-body text-sm text-steel block mb-1">
                Numéro WhatsApp
              </label>
              <input
                type="tel"
                value={psWhatsapp}
                onChange={(e) => setPsWhatsapp(e.target.value)}
                placeholder="Ex : 0612345678"
                className="w-full border border-concrete/20 rounded-sm px-3 py-2 font-body"
              />
            </div>
          </div>

          {psError && <p className="font-body text-sm text-alert">{psError}</p>}
          {psSuccess && (
            <p className="font-body text-sm text-safety-dark">
              Produit star enregistré.
            </p>
          )}

          <button
            type="submit"
            disabled={psLoading}
            className="font-body font-semibold px-6 py-3 bg-safety text-concrete rounded-sm hover:bg-safety-dark transition-colors disabled:opacity-50 self-start"
          >
            {psLoading ? "Enregistrement..." : "Enregistrer le produit star"}
          </button>
        </form>

        <h2 className="font-display text-lg mb-4">
          Annonces particuliers à valider
          {annoncesParticuliers.length > 0 && (
            <span className="ml-2 font-mono text-xs text-alert">
              ({annoncesParticuliers.length})
            </span>
          )}
        </h2>
        <div className="mb-12 bg-white border border-concrete/15 rounded-sm overflow-hidden">
          {annoncesParticuliers.length === 0 ? (
            <p className="font-body text-sm text-steel p-4">
              Aucune annonce de particulier en attente.
            </p>
          ) : (
            annoncesParticuliers.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-4 p-4 border-b border-concrete/10 last:border-b-0 flex-wrap"
              >
                <div className="flex items-center gap-3">
                  {a.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.image_url}
                      alt={a.titre}
                      className="w-12 h-12 object-contain bg-cement border border-concrete/15 rounded-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-sm bg-cement border border-concrete/15" />
                  )}
                  <div>
                    <p className="font-body font-semibold text-sm">
                      {a.titre}
                    </p>
                    <p className="font-mono text-xs text-steel">
                      {a.ville} · {a.quantite} · {a.prix} DH
                      {a.telephone && ` · ${a.telephone}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => validerAnnonceParticulier(a.id)}
                    className="font-body text-xs px-3 py-2 border border-safety bg-safety/10 text-safety-dark rounded-sm hover:bg-safety hover:text-concrete transition-colors"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => refuserAnnonceParticulier(a.id)}
                    className="font-body text-xs px-3 py-2 border border-alert/40 text-alert rounded-sm hover:bg-alert hover:text-white transition-colors"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <h2 className="font-display text-lg mb-4">Fournisseurs</h2>
        <div className="mb-12 bg-white border border-concrete/15 rounded-sm overflow-hidden">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 p-4 border-b border-concrete/10 last:border-b-0"
            >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                {p.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photo_url}
                    alt={p.nom_societe ?? ""}
                    className="w-10 h-10 rounded-full object-cover border border-concrete/15"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-cement border border-concrete/15" />
                )}
                <div>
                  <p className="font-body font-semibold text-sm">
                    {p.nom_societe || "(sans nom)"}
                    {p.est_admin && (
                      <span className="ml-2 font-mono text-xs text-safety-dark">
                        ADMIN
                      </span>
                    )}
                    {!p.est_admin && !p.valide && (
                      <span className="ml-2 font-mono text-xs text-alert">
                        EN ATTENTE DE VALIDATION
                      </span>
                    )}
                    {!p.est_admin && (
                      <button
                        type="button"
                        onClick={() =>
                          setDetailOuvert((prev) => ({
                            ...prev,
                            [p.id]: !prev[p.id],
                          }))
                        }
                        className="ml-2 font-mono text-xs text-safety-dark underline hover:text-alert"
                      >
                        · {contactsParFournisseur[p.id] ?? 0} contact
                        {(contactsParFournisseur[p.id] ?? 0) > 1 ? "s" : ""}{" "}
                        WhatsApp ({detailOuvert[p.id] ? "masquer" : "détail"})
                      </button>
                    )}
                  </p>
                  <p className="font-mono text-xs text-steel">
                    {p.telephone}
                    {p.suspendu && (
                      <span className="ml-2 text-alert">· Suspendu</span>
                    )}
                    {!p.est_admin && p.valide && p.acces_expire_le && (
                      <span
                        className={
                          "ml-2 " +
                          (new Date(p.acces_expire_le) < new Date()
                            ? "text-alert"
                            : "")
                        }
                      >
                        ·{" "}
                        {new Date(p.acces_expire_le) < new Date()
                          ? "Essai gratuit expiré"
                          : `Accès jusqu'au ${new Date(
                              p.acces_expire_le
                            ).toLocaleDateString("fr-FR")}`}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {!p.est_admin && (
                <div className="flex gap-2">
                  {p.telephone && (
                    <a
                      href={whatsappLinkFournisseur(
                        p.telephone,
                        p.nom_societe ?? ""
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-xs px-3 py-2 border border-safety/40 text-safety-dark rounded-sm hover:bg-safety hover:text-concrete transition-colors"
                    >
                      Contacter sur WhatsApp
                    </a>
                  )}
                  {p.telephone && (
                    <a
                      href={whatsappLinkPresentation(
                        p.telephone,
                        p.nom_societe ?? ""
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-xs px-3 py-2 border border-concrete/20 rounded-sm hover:border-safety hover:text-alert transition-colors"
                    >
                      Demander une présentation
                    </a>
                  )}
                  {!p.valide && (
                    <button
                      onClick={() => validerFournisseur(p)}
                      className="font-body text-xs px-3 py-2 border border-safety bg-safety/10 text-safety-dark rounded-sm hover:bg-safety hover:text-concrete transition-colors"
                    >
                      Valider (accès 3 mois)
                    </button>
                  )}
                  {p.valide &&
                    p.acces_expire_le &&
                    new Date(p.acces_expire_le) < new Date() && (
                      <>
                        <button
                          onClick={() => validerFournisseur(p)}
                          className="font-body text-xs px-3 py-2 border border-safety bg-safety/10 text-safety-dark rounded-sm hover:bg-safety hover:text-concrete transition-colors"
                        >
                          Prolonger 3 mois
                        </button>
                        <button
                          onClick={() => activerAbonnementUnAn(p)}
                          className="font-body text-xs px-3 py-2 border border-concrete bg-concrete text-cement rounded-sm hover:bg-concrete-light transition-colors"
                        >
                          Abonnement payé (1 an)
                        </button>
                      </>
                    )}
                  <button
                    onClick={() => toggleSuspension(p)}
                    className="font-body text-xs px-3 py-2 border border-concrete/20 rounded-sm hover:border-safety hover:text-alert transition-colors"
                  >
                    {p.suspendu ? "Réactiver" : "Suspendre"}
                  </button>
                  <button
                    onClick={() => supprimerCompte(p)}
                    className="font-body text-xs px-3 py-2 border border-alert/40 text-alert rounded-sm hover:bg-alert hover:text-white transition-colors"
                  >
                    Supprimer le compte
                  </button>
                </div>
              )}
            </div>

              {!p.est_admin && detailOuvert[p.id] && (
                <div className="bg-cement border border-concrete/10 rounded-sm p-3">
                  {listings.filter((l) => l.user_id === p.id).length === 0 ? (
                    <p className="font-body text-xs text-steel">
                      Aucune annonce déposée.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {listings
                        .filter((l) => l.user_id === p.id)
                        .map((l) => (
                          <div
                            key={l.id}
                            className="flex items-center justify-between gap-4 font-mono text-xs text-steel"
                          >
                            <span className="truncate">{l.titre}</span>
                            <span className="text-safety-dark whitespace-nowrap">
                              {contactsParListing[l.id] ?? 0} contact
                              {(contactsParListing[l.id] ?? 0) > 1 ? "s" : ""}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {!p.est_admin && (
                <div className="flex gap-2 items-center">
                  <input
                    type="email"
                    value={nouveauxEmails[p.id] ?? ""}
                    onChange={(e) =>
                      setNouveauxEmails((prev) => ({
                        ...prev,
                        [p.id]: e.target.value,
                      }))
                    }
                    placeholder="Nouvel email de connexion"
                    className="flex-1 max-w-xs border border-concrete/20 rounded-sm px-3 py-2 font-body text-xs"
                  />
                  <button
                    onClick={() => changerEmail(p)}
                    disabled={
                      emailEnCours === p.id || !nouveauxEmails[p.id]
                    }
                    className="font-body text-xs px-3 py-2 border border-concrete/20 rounded-sm hover:border-safety hover:text-alert transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {emailEnCours === p.id ? "..." : "Changer l'email"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <h2 className="font-display text-lg mb-4">Toutes les annonces</h2>
        <div className="bg-white border border-concrete/15 rounded-sm overflow-hidden">
          {listings.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between gap-4 p-4 border-b border-concrete/10 last:border-b-0"
            >
              <div>
                <p className="font-body font-semibold text-sm">{l.titre}</p>
                <p className="font-mono text-xs text-steel">
                  {l.collection} · {l.ville} · {l.prix} DH
                </p>
              </div>
              <button
                onClick={() => supprimerAnnonce(l.id)}
                className="font-body text-xs px-3 py-2 border border-alert/40 text-alert rounded-sm hover:bg-alert hover:text-white transition-colors"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
