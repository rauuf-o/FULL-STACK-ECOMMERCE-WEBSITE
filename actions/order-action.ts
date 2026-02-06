"use server";

import { prisma } from "@/db/prisma";
import { auth } from "@/auth";
import { getCartItems } from "./cart-action";
import { getUserByID } from "@/actions/user.action";
import type { ShippingAddress, CartItem, OrderItem } from "../types";
import { insertOrderSchema } from "@/lib/validators";
import { convertCartToPlainObject, formatError } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getShippingPriceByWilaya } from "@/lib/shippingRates";
import type { Order } from "@/types";
import { shippingAddressSchema } from "@/lib/validators";
import { Or } from "@prisma/client/runtime/client";

// ---------- CREATE ORDER ----------
export async function createOrder() {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const cart = await getCartItems();
    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "No items in the cart",
        redirectTo: "/cart",
      };
    }

    // Resolve shipping address
    let address: ShippingAddress | undefined;
    if (userId) {
      const user = await getUserByID(userId);
      address = user?.address as ShippingAddress | undefined;
    } else {
      address = cart.shippingAddress as ShippingAddress | undefined;
    }

    if (!address) {
      return {
        success: false,
        message: "No shipping address found",
        redirectTo: "/shipping-adresse",
      };
    }

    // Validate address
    const validatedAddress = address; // optionally: shippingAddressSchema.parse(address)

    // Compute shipping price
    const shippingPrice = getShippingPriceByWilaya(
      validatedAddress.wilaya,
      validatedAddress.deliveryType,
    );

    const totalPrice = cart.itemsPrice + shippingPrice;

    // Validate order
    const validatedOrder = insertOrderSchema.parse({
      userId,
      shippingAddress: validatedAddress,
      itemsPrice: cart.itemsPrice,
      shippingPrice,
      totalPrice,
      isDelivered: false,
      deliveredAt: null,
    });

    // Transaction
    // Transaction
    const orderId = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: validatedOrder,
        select: { id: true },
      });

      // ✅ match Prisma type exactly
      await tx.orderItem.createMany({
        data: (cart.items as OrderItem[]).map((item) => ({
          orderId: order.id,
          productId: item.productId,
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: item.price,
          qty: item.qty,
          taille: item.taille ?? null, // must be null if undefined
        })),
      });

      // Clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: { items: [], itemsPrice: 0, shippingPrice: 0, totalPrice: 0 },
      });

      return order.id;
    });

    return {
      success: true,
      message: "Order created successfully",
      redirectTo: `/order/${orderId}`,
    };
  } catch (error: unknown) {
    console.error("Error creating order:", error);
    return { success: false, message: formatError(error), redirectTo: "/cart" };
  }
}

// ---------- GET ORDER BY ID ----------
export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!orderId) return null;

  // Fetch order with related items and user
  const data = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!data) return null;

  // Validate and parse shipping address
  let shippingAddress: ShippingAddress | undefined = undefined;
  if (data.shippingAddress) {
    try {
      shippingAddress = shippingAddressSchema.parse(data.shippingAddress);
    } catch (e) {
      console.warn("Invalid shippingAddress in order:", orderId, e);
    }
  }

  // Map order items
  const orderItems: OrderItem[] = data.orderItems.map((item) => ({
    productId: item.productId,
    slug: item.slug,
    image: item.image,
    name: item.name,
    price: Number(item.price),
    qty: Number(item.qty),
    taille: item.taille ?? undefined,
  }));

  // Return fully typed Order
  const order: Order = {
    id: data.id,
    createdAt: new Date(data.createdAt),
    isDelivered: data.isDelivered,
    deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : null,
    orderItems,
    user: {
      name: data.user?.name ?? "Unknown",
      email: data.user?.email ?? "Unknown",
    },
    shippingAddress,
    itemsPrice: Number(data.itemsPrice),
    shippingPrice: Number(data.shippingPrice),
    totalPrice: Number(data.totalPrice),
    userId: data.userId ?? null,
  };

  return order;
}

// ---------- GET ORDER SUMMARY ----------
export async function getOrderSummary() {
  const OrderCount = await prisma.order.count();
  const ProductCount = await prisma.product.count();
  const UserCount = await prisma.user.count();

  const totalSalesRaw = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });
  const totalSales = totalSalesRaw._sum.totalPrice ?? 0;

  // ✅ Fix: remove shippingAddress from include, just query orderItems
  const latestOrdersRaw = await prisma.order.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: true,
    },
  });

  // ✅ Type-safe mapping
  const latestSales = latestOrdersRaw.map((order) => {
    const address = order.shippingAddress as ShippingAddress | undefined;

    return {
      id: order.id,
      createdAt: order.createdAt,
      totalPrice: order.totalPrice,
      orderItems: order.orderItems,
      customerName: address?.fullName ?? "Unknown",
      customerPhone: address?.phoneNumber ?? "N/A",
    };
  });

  return { OrderCount, ProductCount, UserCount, totalSales, latestSales };
}

// ---------- GET ALL ORDERS ----------
export async function getAllOrders({
  limit = 10,
  page = 1,
}: {
  limit?: number;
  page?: number;
}) {
  // ✅ Select shippingAddress as a raw JSON field
  const data = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    select: {
      id: true,
      createdAt: true,
      totalPrice: true,
      isDelivered: true,
      orderItems: true,
      shippingAddress: true, // Prisma JSON column, not a relation
    },
  });

  // ✅ Map and parse shippingAddress safely
  return data.map((order) => {
    const address = order.shippingAddress as ShippingAddress | null;

    return {
      ...order,
      customerName: address?.fullName ?? "Unknown",
      customerPhone: address?.phoneNumber ?? "N/A",
    };
  });
}

// ---------- DELETE ORDER ----------
export async function deleteOrder(orderId: string) {
  try {
    await prisma.order.delete({ where: { id: orderId } });
    revalidatePath("/admin/orders");
    return { success: true, message: "Order deleted successfully" };
  } catch (error: unknown) {
    console.error("Error deleting order:", error);
    return { success: false, message: formatError(error) };
  }
}

// ---------- UPDATE ORDER TO DELIVERED ----------
export async function updateOrderToDelivered(orderId: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { isDelivered: true, deliveredAt: new Date() },
    });
    revalidatePath("/admin/orders");
    return { success: true, message: "Order updated successfully" };
  } catch (error: unknown) {
    console.error("Error updating order:", error);
    return { success: false, message: formatError(error) };
  }
}
