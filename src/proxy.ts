import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/env";
import { homeForRole, type Role } from "@/lib/types";

const PUBLIC_PATHS = ["/login", "/activar", "/recuperar", "/actualizar-clave"];

const ADMIN_PREFIXES = ["/admin"];
const STAFF_PREFIXES = ["/equipo", "/admin"];
const PORTAL_PREFIXES = ["/portal"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname);
}

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return res;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // Redirect authenticated users away from auth pages
  if (user && isPublicPath(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Protect dashboard routes
  if (!user) {
    if (
      startsWithAny(pathname, ADMIN_PREFIXES) ||
      startsWithAny(pathname, STAFF_PREFIXES) ||
      startsWithAny(pathname, PORTAL_PREFIXES) ||
      pathname === "/dashboard"
    ) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return res;
  }

  // Fetch profile for role-based checks
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as Role | undefined;

  // Admin routes: only admin
  if (startsWithAny(pathname, ADMIN_PREFIXES) && role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = role ? "/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  // Staff routes: staff, trainer, admin
  if (startsWithAny(pathname, STAFF_PREFIXES) && !["staff", "trainer", "admin"].includes(role ?? "")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/equipo/:path*", "/portal/:path*", "/dashboard"],
};
