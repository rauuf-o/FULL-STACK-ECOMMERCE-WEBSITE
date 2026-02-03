import { CartItem } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
//conver prisma object to json,
export function prismaToJson<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
type PrismaLike = {
  code?: string;
  meta?: { target?: unknown };
};

export function formatError(error: unknown): string {
  // ✅ Zod validation errors
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).join(", ");
  }

  // ✅ Prisma unique constraint error (P2002) - shape check (safe everywhere)
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as PrismaLike).code === "P2002"
  ) {
    const target = (error as PrismaLike).meta?.target;
    if (Array.isArray(target) && target.length) {
      return `Duplicate value for: ${target.join(", ")}.`;
    }
    return " Duplicate value exists.";
  }

  // ✅ Normal Error
  if (error instanceof Error) {
    return error.message || "An unexpected error occurred.";
  }

  return "An unexpected error occurred.";
}
//
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
export function convertCartToPlainObject(cart: any) {
  return {
    ...convertToPlainObject(cart),
    items: cart.items as CartItem[],
    itemsPrice: Number(cart.itemsPrice),
    shippingPrice: Number(cart.shippingPrice),
    totalPrice: Number(cart.totalPrice),
  };
}
//shorten ID
export function shortenId(id: string) {
  return ` ..${id.substring(id.length - 6)}`;
  console.log(shortenId(id));
}
