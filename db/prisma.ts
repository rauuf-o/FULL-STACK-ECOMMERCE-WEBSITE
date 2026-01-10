import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../lib/generated/prisma/client";
import ws from "ws";

/**
 * Enable WebSocket support for Neon
 * (required in serverless environments like Vercel)
 */
neonConfig.webSocketConstructor = ws;

/**
 * Database connection string
 */
const connectionString = process.env.DATABASE_URL!;

/**
 * Create Prisma adapter using Neon connection string
 */
const adapter = new PrismaNeon({ connectionString });

/**
 * Prisma Client with extensions
 * Converts Decimal fields (price, rating) to string
 */
export const prisma = new PrismaClient({ adapter }).$extends({
  result: {
    product: {
      rating: {
        compute(product) {
          return product.rating.toString();
        },
      },
    },
  },
});
