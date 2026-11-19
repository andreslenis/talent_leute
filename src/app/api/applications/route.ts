import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function b(v: unknown) {
  return v === "on" || v === true || v === "true";
}
function n(v: unknown) {
  const x = Number(v);
  return Number.isFinite(x) ? x : null;
}

export async function POST(req: Request) {
  const body = (await req.json()) as Record<string, unknown>;
  const supabase = await createServerSupabaseClient();
  const birth = (body.birth_date as string) || null;
  const age = birth
    ? Math.floor((Date.now() - new Date(birth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  const { data, error } = await supabase
    .from("applications")
    .insert({
      full_name: body.fullName,
      email: body.email,
      phone: body.phone,
      city: body.city,
      profession: body.profession,
      experience_years: n(body.experienceYears),
      motivation: body.motivation,
      document_id: body.document_id,
      birth_date: birth,
      age,
      has_passport: b(body.has_passport),
      available_16_weeks: b(body.available_16_weeks),
      education_level: body.education_level,
      institution: body.institution,
      graduation_year: n(body.graduation_year),
      care_experience_years: n(body.care_experience_years),
      experience_description: body.experience_description,
      worked_with_elderly: b(body.workedElderly),
      elderly_work_detail: body.elderly_work_detail,
      german_level: body.german_level,
      german_course_before: b(body.german_course_before),
      german_certification: b(body.hasCert),
      german_cert_detail: body.german_cert_detail,
      weekly_study_hours: body.weekly_study_hours,
      why_germany: body.why_germany,
      why_elderly: body.why_elderly,
      expectations: body.expectations,
      hardest_part: body.hardest_part,
      adaptation_plan: body.adaptation_plan,
      willing_travel: b(body.willing_travel),
      responsibilities_abroad: body.responsibilities_abroad,
      personal_circumstances: body.personal_circumstances,
      can_organize_travel: b(body.can_organize_travel),
      has_children: b(body.hasChildren),
      children_count: n(body.children_count),
      dependents: b(body.dependents),
      support_network: b(body.support_network),
      currently_working: b(body.currently_working),
      can_attend_16_weeks: b(body.can_attend_16_weeks),
      willing_extra_study: b(body.willing_extra_study),
      willing_virtual_interviews: b(body.willing_virtual_interviews),
      willing_shifts: b(body.willing_shifts),
      availability_notes: body.availability_notes,
      confirm_individual_opportunity: b(body.confirm_individual_opportunity),
      confirm_no_guarantee: b(body.confirm_no_guarantee),
      confirm_truthful_info: b(body.confirm_truthful_info),
      authorize_data_processing: b(body.authorize_data_processing),
      understand_false_info: b(body.understand_false_info),
      understand_no_guarantee_outcome: b(body.understand_no_guarantee_outcome),
      authorize_share_with_employers: b(body.authorize_share_with_employers),
      authorize_third_party_evaluation: b(body.authorize_third_party_evaluation),
      referrer_name: body.referrer_name || body.referrerName,
      status: "preinscripcion",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (body.referrer_name || body.referrerName) {
    await supabase.from("referrals").insert({
      application_id: data.id,
      referrer_name: body.referrer_name || body.referrerName,
    });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
