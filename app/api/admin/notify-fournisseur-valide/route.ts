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

  const { targetUserId, nomSociete } = await req.json();
  if (!targetUserId) {
    return NextResponse.json({ error: "targetUserId manquant" }, { status: 400 });
  }

  const { data: targetUser, error: targetError } =
    await admin.auth.admin.getUserById(targetUserId);

  if (targetError || !targetUser.user?.email) {
    return NextResponse.json({ error: "Fournisseur introuvable" }, { status: 404 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY manquant");
    return NextResponse.json({ success: true, emailSkipped: true });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SoldesBTP.ma <onboarding@resend.dev>",
      to: targetUser.user.email,
      subject: "Félicitations, votre compte SoldesBTP.ma est validé !",
      html: `
        <h2>Félicitations, ${nomSociete ?? ""} !</h2>
        <p>Votre compte fournisseur sur SoldesBTP.ma vient d'être validé par notre équipe.</p>
        <p>Vous pouvez dès maintenant vous connecter et déposer vos annonces :</p>
        <p><a href="https://soldesbtp.ma/connexion">soldesbtp.ma/connexion</a></p>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Erreur d'envoi Resend :", body);
    return NextResponse.json({ success: true, emailSkipped: true });
  }

  return NextResponse.json({ success: true });
}
