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

  const { targetUserId } = await req.json();
  if (!targetUserId) {
    return NextResponse.json({ error: "targetUserId manquant" }, {
      status: 400,
    });
  }

  // Supprime les annonces, le profil, puis le compte lui-même
  await admin.from("listings").delete().eq("user_id", targetUserId);
  await admin.from("profiles").delete().eq("id", targetUserId);
  const { error: deleteError } = await admin.auth.admin.deleteUser(
    targetUserId
  );

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
