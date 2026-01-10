import { z } from "zod";
import { productInsertSchema } from "@/lib/validators";
import { Decimal } from "@prisma/client/runtime/client";
export type Product = z.infer<typeof productInsertSchema> & {
  id: string;
  rating: string;
  createdAt: Date;
};
