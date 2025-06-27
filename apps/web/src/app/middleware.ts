import { type NextRequest, NextResponse } from "next/server";

// 1. Définir les routes protégées et publiques
const protectedRoutes = ["/dashboard", "/profile", "/settings", "/account"];
const publicRoutes = ["/login", "/signup", "/"];

export default async function middleware(req: NextRequest) {
  // 2. Vérifier si la route actuelle est protégée ou publique
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(path);

  // TODO: Refaire une vrai AUTH plus tard
  // 3. Simuler l'authentification pour l'exemple
  //Faire une chance de 25% d'être authentifié
  const isAuthenticated = Math.random() < 0.75; // Simule une authentification 75% du temps

  // 4. Rediriger vers /login si l'utilisateur n'est pas authentifié
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 5. Rediriger vers /dashboard si l'utilisateur est déjà connecté
  if (isPublicRoute && isAuthenticated && path === "/login") {
    //return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes sur lesquelles le Middleware ne doit pas s'exécuter
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
