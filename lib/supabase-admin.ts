import { createClient } from "@supabase/supabase-js";

// ATTENTION : ce client utilise la clé service_role, qui contourne toutes
// les règles de sécurité (RLS). Il ne doit JAMAIS être importé dans un
// composant client ni exposé au navigateur — uniquement dans des routes
// API (app/api/**/route.ts), qui s'exécutent côté serveur.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
