import { type NextRequest, NextResponse } from "next/server";

interface UserData {
  id?: number;
  email?: string;
  name?: string;
  company_id?: number;
}

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/public-menus/*",
];

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];
const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NODE_ENV === "production"
    ? "https://dash.goofykhp.fr"
    : null;

const serverHttpClient = {
  async fetch(endpoint: string, req: NextRequest): Promise<Response> {
    const cookieHeader = req.headers.get("cookie") || "";

    const baseUrl = API_URL || req.nextUrl.origin;
    const url = new URL(endpoint, baseUrl);

    return fetch(url.toString(), {
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

  if (path === "/") {
    const target = isAuthenticated ? "/dashboard" : "/login";
    const url = new URL(target, req.url);
    return NextResponse.redirect(url);
  }

  if (path === "/ingredient" || path === "/ingredients") {
    //Redirect to /stocks
    const url = new URL("/stocks", req.url);
    return NextResponse.redirect(url);
  }

  if (path === "/waiters/table" || path === "/waiters/tables") {
    //Redirect to /waiters
    const url = new URL("/waiters", req.url);
    return NextResponse.redirect(url);
  }

  if (!isPublicRoute(path) && !isAuthenticated) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute(path) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const response = NextResponse.next();

  if (isAuthenticated && userData) {
    const encodedUserData = btoa(
      new TextEncoder()
        .encode(JSON.stringify(userData))
        .reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    response.headers.set("x-user", encodedUserData);

    if (userData.id) response.headers.set("x-user-id", userData.id.toString());
    if (userData.name) response.headers.set("x-user-name", userData.name);
  }

  return response;
}

async function checkAuthenticationAndGetUser(
  req: NextRequest
): Promise<{ isAuthenticated: boolean; userData?: UserData }> {
  try {
    const khpSession = req.cookies.get("khp_session")?.value;

    if (!khpSession) return { isAuthenticated: false };

    const response = await serverHttpClient.fetch("/api/user", req);
    const isValid = response.ok;

    let userData = undefined;
    if (isValid) {
      userData = await response.json().catch(() => undefined);
    }

    return { isAuthenticated: isValid, userData };
  } catch (error) {
    console.error(
      "Error checking authentication and getting user data:",
      error
    );
    return { isAuthenticated: false };
  }
}

function isAuthRoute(path: string): boolean {
  return authRoutes.some((route) => matchesRoute(path, route));
}

function isPublicRoute(path: string): boolean {
  return publicRoutes.some((route) => matchesRoute(path, route));
}

function matchesRoute(path: string, route: string): boolean {
  if (route.endsWith("/*")) {
    const baseRoute = route.slice(0, -2);
    return path === baseRoute || path.startsWith(`${baseRoute}/`);
  }

  if (route === "/") {
    return path === route;
  }

  return path === route || path.startsWith(`${route}/`);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
