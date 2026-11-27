import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { GroupLabel, ApplicationStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneForWhatsApp(phone: string | null): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/\s/g, "").replace(/-/g, "");
  return cleaned.startsWith("0") ? "549" + cleaned.slice(1) : cleaned;
}

export function getWhatsAppUrl(phone: string | null, message?: string): string | null {
  const formatted = formatPhoneForWhatsApp(phone);
  if (!formatted) return null;
  const params = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${formatted}${params}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getScoreColor(score: number | null): string {
  if (score === null) return "text-gray-400";
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

export function getGroupBadgeVariant(group: GroupLabel | null) {
  switch (group) {
    case "A":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "B":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "C":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
}

export function getStatusBadgeVariant(status: ApplicationStatus) {
  switch (status) {
    case "preselected":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case "interviewed":
      return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
    case "selected":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "enrolled":
      return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "pending":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
}

export function getStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    preselected: "Preseleccionado",
    interviewed: "Entrevistado",
    selected: "Seleccionado",
    enrolled: "Matriculado",
    rejected: "Rechazado",
    pending: "Pendiente",
  };
  return labels[status] || status;
}

export function getGroupLabel(group: GroupLabel | null): string {
  if (!group) return "—";
  return `GRUPO ${group}`;
}