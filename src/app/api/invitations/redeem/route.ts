import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/env";

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function invalid(message = "Código inválido o expirado. Verifica el código y el correo.") {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos antes de volver a intentar." },
      { status: 429 },
    );
  }

  if (!hasServiceRole) {
    return NextResponse.json(
      {
        error:
          "La activación por código no está disponible en este servidor. Falta SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { fullName?: string; email?: string; code?: string; password?: string }
    | null;

  const fullName = body?.fullName?.trim() ?? "";
  const email = body?.email?.trim().toLowerCase() ?? "";
  const code = body?.code?.trim().toUpperCase() ?? "";
  const password = body?.password ?? "";

  if (!fullName || !email || !code || password.length < 8) {
    return NextResponse.json({ error: "Completa todos los campos. La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "El correo electrónico no es válido." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Configuración incompleta del servidor." },
      { status: 503 },
    );
  }

  const { data: invitation, error: inviteError } = await admin
    .from("invitations")
    .select("id, code, email, application_id, role, expires_at, used_at")
    .eq("code", code)
    .maybeSingle();

  if (inviteError || !invitation) return invalid();
  if (invitation.used_at) return invalid("Este código ya fue utilizado.");
  if (new Date(invitation.expires_at).getTime() < Date.now()) return invalid("Este código expiró. Solicita uno nuevo al equipo.");
  if (invitation.email.toLowerCase() !== email) {
    return invalid("El código no corresponde a este correo electrónico.");
  }

  if (invitation.application_id) {
    const { data: application } = await admin
      .from("applications")
      .select("id, user_id")
      .eq("id", invitation.application_id)
      .maybeSingle();

    if (application?.user_id) {
      return invalid("Esta invitación ya fue utilizada.");
    }
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    const message = createError?.message ?? "";
    if (/already|exists|registered/i.test(message)) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "No pudimos crear la cuenta. Intenta de nuevo." }, { status: 400 });
  }

  const userId = created.user.id;
  const role = invitation.role ?? "alumno";

  await admin.from("profiles").upsert(
    { id: userId, full_name: fullName, email, role },
    { onConflict: "id" },
  );

  if (invitation.application_id) {
    await admin.from("applications").update({ user_id: userId }).eq("id", invitation.application_id);
  }

  await admin.from("invitations").update({ used_at: new Date().toISOString() }).eq("id", invitation.id);

  return NextResponse.json({ ok: true });
}
