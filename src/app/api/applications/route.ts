import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("applications")
    .insert({
      full_name: body.fullName,
      email: body.email,
      phone: body.phone,
      city: body.city,
      profession: body.profession,
      experience_years: body.experienceYears,
      motivation: body.motivation,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (body.referrerName) {
    await supabase.from("referrals").insert({
      application_id: data.id,
      referrer_name: body.referrerName,
    });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
