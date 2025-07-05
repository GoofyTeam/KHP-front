import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/settings", "/account"];
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const sessionCache = new Map<
  string,
  { isValid: boolean; timestamp: number; userData?: any }
>();
const CACHE_TTL = 30 * 1000;

const serverHttpClient = {
  async fetch(endpoint: string, req: NextRequest): Promise<Response> {
    const cookieHeader = req.headers.get("cookie") || "";

    return fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });
  },
};

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const { isAuthenticated, userData } =
    await checkAuthenticationAndGetUser(req);

  if (isProtectedRoute(path) && !isAuthenticated) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute(path) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const response = NextResponse.next();

  if (isAuthenticated && userData) {
    const encodedUserData = Buffer.from(JSON.stringify(userData)).toString(
      "base64",
    );

    response.headers.set("x-user", encodedUserData);

    if (userData.id) response.headers.set("x-user-id", userData.id.toString());
    if (userData.email) response.headers.set("x-user-email", userData.email);
    if (userData.name) response.headers.set("x-user-name", userData.name);
  }

  return response;
}

async function checkAuthenticationAndGetUser(
  req: NextRequest,
): Promise<{ isAuthenticated: boolean; userData?: any }> {
  try {
    const khpSession = req.cookies.get("khp_session")?.value;

    if (!khpSession) return { isAuthenticated: false };

    const cacheKey = khpSession;
    const cached = sessionCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return {
        isAuthenticated: cached.isValid,
        userData: cached.userData,
      };
    }

    const response = await serverHttpClient.fetch("/api/user", req);
    const isValid = response.ok;

    let userData = undefined;
    if (isValid) {
      userData = await response.json().catch(() => undefined);
    }

    sessionCache.set(cacheKey, {
      isValid,
      userData,
      timestamp: Date.now(),
    });

    return { isAuthenticated: isValid, userData };
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'authentification:",
      error,
    );
    return { isAuthenticated: false };
  }
}

function isProtectedRoute(path: string): boolean {
  return protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
}

function isAuthRoute(path: string): boolean {
  return authRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
