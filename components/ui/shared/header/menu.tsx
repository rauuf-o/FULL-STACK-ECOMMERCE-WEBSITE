"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu as MenuIcon, ShoppingBag, Shield } from "lucide-react";
import Image from "next/image";

import Toggle from "./mood-toggle";
import UserButton from "./user-button";
import { Sheet, SheetContent, SheetTrigger } from "../../sheet";
import { getCartCount } from "@/actions/cart-action";

const NAV_ITEMS = [
  { label: "Nouveautés", href: "/" },
  { label: "Boutique", href: "/shop" },
  { label: "Ensembles", href: "/ensembles" },
  { label: "Contact", href: "/contact" },
];

export default function Menu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cartCount, setCartCount] = useState(0);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    const load = async () => {
      const count = await getCartCount();
      setCartCount(Number(count) || 0);
    };

    load();

    const onCartUpdated = () => {
      load();
      startTransition(() => router.refresh());
    };

    window.addEventListener("cart:updated", onCartUpdated);
    return () => window.removeEventListener("cart:updated", onCartUpdated);
  }, [router]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur p-5">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        {/* ================= LEFT ================= */}
        <div className="flex items-center gap-2">
          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex h-12 w-12 items-center justify-center">
                  <MenuIcon className="h-6 w-6 text-primary" />
                </button>
              </SheetTrigger>

              <SheetContent side="left" className="pt-10">
                <nav className="flex flex-col gap-4">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-base font-semibold"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-8 space-y-4">
                  <Toggle />
                  <UserButton />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="h-10 w-10 relative rounded-lg overflow-hidden">
              <Image
                src="/images/logo2.png"
                alt="Logo"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <div className="leading-none">
              <span className="block text-primary text-lg font-extrabold tracking-widest uppercase">
                Mounir 16
              </span>
              <span className="block text-[10px] tracking-[0.3em] text-primary/70 uppercase font-bold">
                Officiel
              </span>
            </div>
          </Link>
        </div>

        {/* ================= CENTER (DESKTOP NAV) ================= */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "text-xs font-extrabold uppercase tracking-wider transition",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Toggle />
            <UserButton />
          </div>

          <Link
            href="/cart"
            className="relative flex h-12 w-12 items-center justify-center"
          >
            <ShoppingBag className="h-6 w-6 text-primary" />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-black">
                {cartCount}
              </span>
            )}
            {isPending && (
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
