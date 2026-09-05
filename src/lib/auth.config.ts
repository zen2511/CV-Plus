import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      if (
        process.env.MAINTENANCE_MODE === "true" &&
        nextUrl.pathname !== "/maintenance"
      ) {
        return Response.redirect(new URL("/maintenance", nextUrl));
      }

      // L'authentification n'est requise que pour les pages /admin
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      if (!isAdminRoute) return true;

      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === "/admin/login";

      if (!isLoggedIn && !isLoginPage) return false;
      if (isLoggedIn && isLoginPage) {
        return Response.redirect(new URL("/admin", nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;