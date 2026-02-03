import { Banana } from "lucide-react";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "FaFa E-Commerce";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION || "The best e-commerce platform.";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.NEXT_PUBLIC_LATEST_PRODUCTS_LIMIT) || 4;
export const signInDefaultValues = {
  email: "",
  password: "",
};
export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;
export const productDefaultValues = {
  id: undefined,
  name: "",
  slug: "",
  category: "",
  brand: "",
  description: "",
  stock: 0,
  images: [],
  isFeatured: false,
  price: 0,
  rating: "0",
  numReviews: "0",
  banner: null,
};
