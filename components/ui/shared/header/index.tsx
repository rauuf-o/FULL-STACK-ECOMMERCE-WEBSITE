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
  return <Menu />;
};

export default Header;
