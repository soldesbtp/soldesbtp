import { createClient } from "@/lib/supabase-server";

export type ProduitStar = {
  id: number;
  titre: string | null;
  description: string | null;
  prix: number | null;
  image_url_1: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
  whatsapp: string | null;
  message_accrocheur: string | null;
  image_barree_url: string | null;
};

export async function getProduitStar(): Promise<ProduitStar | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("produit_star")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data || !data.titre || !data.image_url_1) {
    return null;
  }

  return data as ProduitStar;
}
