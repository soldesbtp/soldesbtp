import { createClient } from "@/lib/supabase-server";

export type DbListing = {
  id: string;
  titre: string;
  collection: string;
  type_carrelage: string | null;
  importateur: string | null;
  telephone: string | null;
  format: string | null;
  ville: string;
  quantite: string | null;
  prix_original: number | null;
  prix: number;
  image_url: string | null;
  pays_origine: string | null;
  fournisseur_photo?: string | null;
  user_id: string | null;
  created_at: string;
};

export async function getLatestListings(limit = 6): Promise<DbListing[]> {
  const supabase = createClient();

  // On récupère un lot plus large que nécessaire (jusqu'à 30 annonces
  // récentes), puis on en tire un échantillon aléatoire — ainsi la page
  // d'accueil change à chaque visite au lieu d'afficher toujours les mêmes.
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Erreur lors de la récupération des annonces :", error.message);
    return [];
  }

  const toutes = data ?? [];

  // Mélange aléatoire (algorithme de Fisher-Yates)
  const melangees = [...toutes];
  for (let i = melangees.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [melangees[i], melangees[j]] = [melangees[j], melangees[i]];
  }

  const listings = melangees.slice(0, limit);

  const userIds = Array.from(
    new Set(listings.map((l) => l.user_id).filter(Boolean))
  ) as string[];

  if (userIds.length === 0) {
    return listings;
  }

  const { data: profils } = await supabase
    .from("profiles")
    .select("id, photo_url")
    .in("id", userIds);

  const photoParUserId: Record<string, string | null> = {};
  (profils ?? []).forEach((p) => {
    photoParUserId[p.id as string] = p.photo_url as string | null;
  });

  return listings.map((l) => ({
    ...l,
    fournisseur_photo: l.user_id ? photoParUserId[l.user_id] ?? null : null,
  }));
}
