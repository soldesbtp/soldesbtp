import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");

  // Vérifie qui appelle, avec la clé publique (juste pour lire l'identité)
  const supabaseAuth = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: callerData, error: callerError } =
    await supabaseAuth.auth.getUser(token);

  if (callerError || !callerData.user) {
    return NextResponse.json({ error: "Session invalide" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Vérifie que celui qui appelle est bien administrateur
  const { data: callerProfile } = await admin
    .from("profiles")
    .select("est_admin")
    .eq("id", callerData.user.id)
    .maybeSingle();

  if (!callerProfile?.est_admin) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, {
      status: 403,
    });
  }

  const { targetUserId, newEmail } = await req.json();
  if (!targetUserId || !newEmail) {
    return NextResponse.json(
      { error: "targetUserId ou newEmail manquant" },
      { status: 400 }
    );
  }

  // Changement instantané, confirmé d'office : aucun email de confirmation
  // n'est envoyé (ni à l'ancienne ni à la nouvelle adresse).
  const { error } = await admin.auth.admin.updateUserById(targetUserId, {
    email: newEmail,
    email_confirm: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
