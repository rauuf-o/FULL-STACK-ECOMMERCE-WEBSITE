"use server";
import { Product } from "./../types/index";

import { prisma } from "@/db/prisma";
import { auth } from "../auth";
import { getCartItems } from "./cart-action";
import { getUserByID } from "@/actions/user.action";
import type { ShippingAddress, CartItem } from "../types";
import { insertOrderSchema } from "@/lib/validators";
import { convertCartToPlainObject } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../lib/constants";
import { getShippingPriceByWilaya } from "@/lib/shippingRates";
import { shippingAddressSchema } from "@/lib/validators";

export async function createOrder() {
  try {
    const session = await auth();
    const userId = session?.user?.id as string | undefined;

    const cart = await getCartItems();

    console.log("createOrder cart:", cart);
    console.log("createOrder userId:", userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "No items in the cart",
        redirectTo: "/cart",
      };
    }

    // resolve address (user OR guest)
    let address: ShippingAddress | undefined;

    if (userId) {
      const user = await getUserByID(userId);
      address = (user?.address as ShippingAddress) ?? undefined;
    } else {
      address = (cart.shippingAddress as ShippingAddress) ?? undefined;
    }

    console.log("createOrder address:", address);

    if (!address) {
      return {
        success: false,
        message: "No shipping address found",
        redirectTo: "/shipping-adresse",
      };
    }

    // ✅ (recommended) validate shipping address
    // ensures address has deliveryType + wilaya, etc.
    const validatedAddress = shippingAddressSchema.parse(address);

    // ✅ compute shipping price server-side
    const shippingPrice = getShippingPriceByWilaya(
      validatedAddress.wilaya,
      validatedAddress.deliveryType,
    );

    // ✅ compute total using server truth
    const totalPrice = cart.itemsPrice + shippingPrice;

    // validate order with ZOD
    const validatedOrder = insertOrderSchema.parse({
      userId: userId ?? null,
      shippingAddress: validatedAddress, // ✅ use validated address
      itemsPrice: cart.itemsPrice,
      shippingPrice, // ✅ override cart.shippingPrice
      totalPrice, // ✅ override cart.totalPrice
    });

    console.log("createOrder validatedOrder:", validatedOrder);

    // transaction
    const orderId = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: validatedOrder,
        select: { id: true },
      });

      await tx.orderItem.createMany({
        data: (cart.items as CartItem[]).map((item) => ({
          orderId: order.id,
          productId: item.productId,
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: item.price,
          qty: item.quantity,
          taille: item.taille || null,
        })),
      });

      // ✅ clear cart (keep your logic)
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          itemsPrice: 0,
          shippingPrice: 0,
          totalPrice: 0,
        },
      });

      return order.id;
    });

    return {
      success: true,
      message: "Order created successfully",
      redirectTo: `/order/${orderId}`,
    };
  } catch (error: any) {
    console.error("Error creating order:", error);

    return {
      success: false,
      message: error?.message || "Failed to create order",
      redirectTo: "/cart",
    };
  }
}

//get order by id
export async function getOrderById(orderId: string | undefined) {
  if (!orderId) return null; // ✅ important

  const data = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: true, // ✅ Now includes taille field
      user: { select: { name: true, email: true } },
    },
  });

  return convertCartToPlainObject(data);
}

//get sales data and order summary

export async function getOrderSummary() {
  // get counts for each resource
  const OrderCount = await prisma.order.count();
  const ProductCount = await prisma.product.count();
  const UserCount = await prisma.user.count();

  // total sales
  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });

  // latest sales: extract customerName + customerPhone from shippingAddress
  const latestOrdersRaw = await prisma.order.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      totalPrice: true,

      orderItems: true, // ✅ Now includes taille field
      shippingAddress: true, // internal use only (we won't return it)
    },
  });

  const latestSales = latestOrdersRaw.map((order) => {
    const address = (order.shippingAddress ?? {}) as ShippingAddress;

    return {
      id: order.id,
      createdAt: order.createdAt,
      totalPrice: order.totalPrice,

      orderItems: order.orderItems, // ✅ Includes taille

      customerName: address.fullName ?? "Unknown",
      customerPhone: address.phoneNumber ?? "N/A",
    };
  });

  return {
    OrderCount,
    ProductCount,
    UserCount,
    totalSales,
    latestSales,
  };
}

//get all orders
// get all orders (with customerName + customerPhone from shippingAddress)
export async function getAllOrders({
  limit = 10,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const data = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    select: {
      id: true,
      createdAt: true,
      totalPrice: true,
      isDelivered: true,
      shippingAddress: true, // ✅ we extract name/phone from here
    },
  });
  type ShippingAddressMini = {
    fullName?: string;
    phoneNumber?: string;
  };

  const mapped = data.map((o) => {
    const address = (o.shippingAddress ?? {}) as ShippingAddressMini;

    return {
      ...o,
      customerName: address.fullName ?? "Unknown",
      customerPhone: address.phoneNumber ?? "N/A",
    };
  });

  return mapped.map((o) => convertCartToPlainObject(o));
}

//delete order
export async function deleteOrder(orderId: string) {
  try {
    await prisma.order.delete({ where: { id: orderId } });
    revalidatePath("/admin/orders");
    return { success: true, message: "Order deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return {
      success: false,
      message: error?.message || "Failed to delete order",
    };
  }
}

//order update to Delivered
export async function updateOrderToDelivered(orderId: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { isDelivered: true, deliveredAt: new Date() },
    });
    revalidatePath("/admin/orders");
    return { success: true, message: "Order updated successfully" };
  } catch (error: any) {
    console.error("Error updating order:", error);
    return {
      success: false,
      message: error?.message || "Failed to update order",
    };
  }
}
