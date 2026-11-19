"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS, type Role } from "@/lib/types";
import { Select } from "@/components/ui/fields";

const ROLES: Role[] = ["alumno", "staff", "trainer", "admin"];

export function RoleSelect({
  userId,
  role,
  disabled = false,
}: {
  userId: string;
  role: Role;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(role);
  const [saving, setSaving] = useState(false);

  async function onChange(next: string) {
    setValue(next as Role);
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ role: next }).eq("id", userId);
    setSaving(false);
    router.refresh();
  }

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || saving}
      aria-label="Rol del usuario"
      className="max-w-40 py-1.5 text-xs"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {ROLE_LABELS[r]}
        </option>
      ))}
    </Select>
  );
}
