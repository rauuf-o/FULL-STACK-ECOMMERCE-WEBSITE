import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
//conver prisma object to json,
export function prismaToJson<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
