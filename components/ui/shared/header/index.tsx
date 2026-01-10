"use client";

import dynamic from "next/dynamic";
import { ShoppingCart, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../../button";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";

// ✅ Render Toggle only on the client (prevents hydration mismatch)
const Toggle = dynamic(() => import("./mood-toggle"), {
  ssr: false,
  loading: () => <div className="h-9 w-9" aria-hidden="true" />,
});

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper lg:mx-auto flex-between">
        <div className="flex-start">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.svg"
              alt="logo"
              width={60}
              height={60}
              priority
            />
            <span className="hidden lg:block font-bold text-2xl ml-3">
              {APP_NAME}
            </span>
          </Link>
        </div>

        <Menu />
      </div>
    </header>
  );
};

export default Header;
