import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { userId, nomSociete, telephone, email } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "userId manquant" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    nom_societe: nomSociete,
    telephone,
    valide: false,
  });

  if (profileError) {
    console.error("Erreur création profil fournisseur :", profileError.message);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!apiKey || !adminEmail) {
    console.error("RESEND_API_KEY ou ADMIN_NOTIFICATION_EMAIL manquant");
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
      to: adminEmail,
      subject: `Nouveau fournisseur à valider : ${nomSociete}`,
      html: `
        <h2>Nouvelle inscription fournisseur</h2>
        <p><strong>Société :</strong> ${nomSociete}</p>
        <p><strong>Téléphone :</strong> ${telephone}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p>Connecte-toi sur <a href="https://soldesbtp.ma/admin">soldesbtp.ma/admin</a> pour examiner et valider ce compte.</p>
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
