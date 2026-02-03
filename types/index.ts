import { z } from "zod";
import { productInsertSchema } from "@/lib/validators";
import { cartSchema } from "@/lib/validators";
import { cartItemSchema } from "@/lib/validators";
import { Decimal } from "@prisma/client/runtime/client";
import {
  shippingAddressSchema,
  insertOrderItemSchema,
  insertOrderSchema,
} from "@/lib/validators";
export type Product = z.infer<typeof productInsertSchema> & {
  id: string;
  rating: string;
  createdAt: Date;
};
export type Cart = z.infer<typeof cartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type OrderItem = z.infer<typeof insertOrderItemSchema>;
export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderItems: OrderItem[];
  user: {
    name: string;
    email: string;
  };
};
