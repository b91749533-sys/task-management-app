import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isMockMode, createMockClient } from "./lib/supabase/mock";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  let supabase;

  if (isMockMode) {
    supabase = createMockClient({
      get: (name) => request.cookies.get(name),
      set: (name, value, options) => {
        request.cookies.set(name, value);
        response = NextResponse.next({
          request,
        });
        response.cookies.set(name, value, options);
      },
      delete: (name) => {
        request.cookies.delete(name);
        response = NextResponse.next({
          request,
        });
        response.cookies.delete(name);
      },
    }) as any;
  } else {
    supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  
  // Skip auth checks for static assets, public files, etc.
  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon.ico") ||
    path.match(/\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$/)
  ) {
    return response;
  }

  const isAuthRoute = ["/login", "/signup", "/forgot-password", "/reset-password"].some(
    (route) => path === route
  );
  
  const isProtectedRoute = ["/dashboard", "/board", "/calendar", "/analytics"].some(
    (route) => path === route || path.startsWith(route + "/")
  );

  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  if (path === "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = user ? "/dashboard" : "/login";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
