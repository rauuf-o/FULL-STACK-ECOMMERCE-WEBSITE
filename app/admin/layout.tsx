// app/admin/layout.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import Menu from "@/components/ui/shared/header/menu";
import MainNav from "./main-nav";
import MobileAdminNav from "./mobile-nav";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          {/* ✅ Mobile sidebar trigger */}
          <MobileAdminNav />

          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.svg"
              alt="logo"
              width={40}
              height={40}
              priority
              className="rounded-lg"
            />
            <div className="hidden sm:block">
              <div className="text-sm font-semibold leading-none">
                {APP_NAME}
              </div>
              <div className="mt-1 text-xs leading-none text-muted-foreground">
                Admin Dashboard
              </div>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:block">
              <Input
                type="search"
                placeholder="Search products, orders..."
                className="w-[220px] rounded-xl lg:w-[320px]"
              />
            </div>
            <Menu />
          </div>
        </div>
      </header>

      {/* Shell */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[260px_1fr]">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block">
          <div className="rounded-2xl border bg-background p-4 shadow-sm">
            <div className="mb-3">
              <div className="text-sm font-semibold">Navigation</div>
              <div className="text-xs text-muted-foreground">
                Manage your store
              </div>
            </div>

            <Separator className="my-3" />

            <MainNav />

            <Separator className="my-4" />

            <div className="rounded-xl bg-muted/40 p-3">
              <div className="text-xs font-medium">Tip</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Use search to quickly find orders and products.
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0">
          <div className="rounded-2xl border bg-background p-4 shadow-sm sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
