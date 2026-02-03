import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from "@/lib/constants";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            closeButton
            duration={3500}
            visibleToasts={3}
            toastOptions={{
              classNames: {
                toast: [
                  "rounded-xl border bg-background shadow-lg",
                  "transition-all duration-200 ease-out",
                ].join(" "),
                title: "font-semibold text-foreground",
                description: "text-sm text-muted-foreground",
                actionButton:
                  "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                closeButton:
                  "bg-background hover:bg-muted border border-border rounded-lg transition-colors",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
