"use client";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  city: z.string().min(2),
  profession: z.string().min(2),
  experienceYears: z.coerce.number().min(0),
  motivation: z.string().min(10),
  referrerName: z.string().optional(),
});

export default function PostularPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      setErrors("Revisa los campos obligatorios.");
      return;
    }
    setErrors(null);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setStatus(res.ok ? "Postulación enviada." : "Error al enviar.");
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Formulario de Postulación</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input name="fullName" placeholder="Nombre completo" className="w-full border rounded p-2" required />
        <input name="email" type="email" placeholder="Correo" className="w-full border rounded p-2" required />
        <input name="phone" placeholder="Teléfono" className="w-full border rounded p-2" required />
        <input name="city" placeholder="Ciudad" className="w-full border rounded p-2" required />
        <input name="profession" placeholder="Profesión" className="w-full border rounded p-2" required />
        <input name="experienceYears" type="number" placeholder="Años de experiencia" className="w-full border rounded p-2" required />
        <textarea name="motivation" placeholder="Motivación" className="w-full border rounded p-2" required />
        <input name="referrerName" placeholder="Quién te refiere (opcional)" className="w-full border rounded p-2" />
        <button type="submit" className="rounded bg-black text-white px-4 py-2">Enviar postulación</button>
        {errors && <p className="text-red-600 text-sm">{errors}</p>}
        {status && <p className="text-green-600 text-sm">{status}</p>}
      </form>
    </section>
  );
}
