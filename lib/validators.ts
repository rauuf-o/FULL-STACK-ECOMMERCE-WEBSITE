import { Currency } from "lucide-react";
import { nonnegative, refine, z } from "zod";
//schema for inserting product
export const productInsertSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  category: z.string().min(3),
  brand: z.string().min(2),
  description: z.string().min(10),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: z.coerce.number().min(0),
  taille: z.array(z.string()).optional(), // ✅ must stay like this
});

// Update schema
export const updateProductSchema = productInsertSchema.extend({
  id: z.string().min(1, "Product ID is required"),
});

// Form schema
export const productFormSchema = productInsertSchema.extend({
  id: z.string().optional(),
});

//Schema for signing in user
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
//Schema for signing up user
export const signUpSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export const shippingAddressSchema = z.discriminatedUnion("deliveryType", [
  z.object({
    deliveryType: z.literal("STOP_DESK"),
    fullName: z.string().min(3, "Full name must be at least 3 characters long"),
    phoneNumber: z.string().min(8, "Phone number must be at least 8 digits"),

    // ✅ add this
    wilaya: z.string().min(2, "Wilaya is required"),

    stopDeskId: z.string().min(1, "Please select a stop desk"),
  }),

  z.object({
    deliveryType: z.literal("HOME"),
    fullName: z.string().min(3, "Full name must be at least 3 characters long"),
    phoneNumber: z.string().min(8, "Phone number must be at least 8 digits"),

    wilaya: z.string().min(2, "Wilaya is required"),
    baladiya: z.string().min(2, "Baladiya is required"),
    address: z.string().min(5, "Address must be at least 5 characters long"),
  }),
]);
//cart schema
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Product name is required"),
  qty: z.coerce
    .number()
    .int()
    .nonnegative("Quantity must be a non-negative integer"),
  slug: z.string().min(1, "Slug is required"),
  image: z.string().min(1, "Image is required"),
  price: z.coerce.number().min(0, "Price must be a non-negative number"),
  taille: z.string().optional(), // ✅ Add this line
});

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: z.coerce.number().min(0, "Items price must be non-negative"),
  totalPrice: z.coerce.number().min(0, "Total price must be non-negative"),
  shippingPrice: z.coerce
    .number()
    .min(0, "Shipping price must be non-negative"),
  sessionCartId: z.string().min(1, "Session Cart ID is required"),
  userId: z.string().optional().nullable(),

  // ✅ Add optional shipping address
  shippingAddress: shippingAddressSchema.optional(),
});

//schema for inserting orders
export const insertOrderSchema = z.object({
  userId: z.string().nullable(),
  shippingAddress: z.any(), // or your ShippingAddress schema
  itemsPrice: z.number(),
  shippingPrice: z.number(),
  totalPrice: z.number(),

  // ✅ add these
  isDelivered: z.boolean().default(false),
  deliveredAt: z.date().nullable().optional(),
});

// ✅ Add taille field
export const insertOrderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  qty: z.coerce.number().min(1, "Quantity must be at least 1"),

  // ✅ single chosen size
  taille: z.string().optional(),
});
