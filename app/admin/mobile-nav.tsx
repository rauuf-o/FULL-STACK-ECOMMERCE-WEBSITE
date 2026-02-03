"use client";

import React from "react";
import { Menu as MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import MainNav from "./main-nav";

export default function MobileAdminNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden rounded-xl"
          aria-label="Open admin navigation"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[280px] p-4">
        <SheetHeader>
          <SheetTitle>Admin</SheetTitle>
        </SheetHeader>

        <Separator className="my-3" />

        {/* ✅ Same nav as desktop */}
        <MainNav />
      </SheetContent>
    </Sheet>
  );
}
