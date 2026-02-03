export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    // protect everything EXCEPT these
    "/((?!api|_next|cart|shipping|confirmed|checkout).*)",
  ],
};

export const runtime = "nodejs";
