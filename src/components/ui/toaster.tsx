"use client";

import { Toaster } from "sonner";

export function ToasterComponent() {
  return <Toaster position="bottom-right" richColors closeButton duration={4000} />;
}
