// components/admin/main-nav.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { LayoutDashboard, Package, ShoppingBag, Users } from "lucide-react";

const links = [
  { title: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { title: "Users", href: "/admin/users", icon: Users },
];

export default function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-1", className)} {...props}>
      {links.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(link.href + "/");
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
              "hover:bg-muted/60 hover:text-foreground",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
            />
            <span>{link.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
