"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, cartSchema } from "@/lib/validators";
import { convertCartToPlainObject, formatError } from "@/lib/utils";
import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
// Prisma import removed: avoid unused import after adjusting JSON casts
import { ShippingAddress } from "@/types";

const calcPrice = (items: CartItem[]) => {
  const itemsPrice = items.reduce(
    (total, item) => total + item.price * item.qty, // ✅ Changed from quantity to qty
    0,
  );

  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = itemsPrice + shippingPrice;

  return { itemsPrice, shippingPrice, totalPrice };
};

export async function addItemToCart(data: CartItem) {
  try {
    // ✅ cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("No cart session ID found");

    // ✅ auth
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : null;

    // ✅ get cart (plain)
    const cart = await getCartItems();
    console.log("cart from DB:", cart);

    // ✅ validate item
    const item = cartItemSchema.parse(data);
    console.log("validated item:", item);

    // ✅ ensure product exists
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    console.log("product:", product?.id);
    if (!product) throw new Error("Product not found");

    // ✅ create new cart if not exists
    if (!cart) {
      const newCart = cartSchema.parse({
        sessionCartId,
        items: [item],
        userId,
        ...calcPrice([item]),
      });

      console.log("✅ newCart validated:", newCart);

      await prisma.cart.create({
        data: {
          sessionId: newCart.sessionCartId,
          userId: newCart.userId,
          // Prisma JSON input can be strict depending on generated types;
          // cast to any here to satisfy the client while preserving runtime shape.
          items: newCart.items as CartItem[],
          itemsPrice: newCart.itemsPrice,
          shippingPrice: newCart.shippingPrice,
          totalPrice: newCart.totalPrice,
        },
      });

      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: "Item added to cart " + product.name,
      };
    }

    // ✅ check if item already exists in cart (match by productId AND taille)
    const existItem = (cart.items as CartItem[]).find(
      (x) => x.productId === item.productId && x.taille === item.taille,
    );

    if (existItem) {
      //check stock
      if (product.stock < existItem.qty + 1) {
        throw new Error("Not enough stock available");
      }

      //increase quantity
      const itemToUpdate = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId && x.taille === item.taille,
      )!;
      itemToUpdate.qty = existItem.qty + 1;
    } else {
      //if item does not exist, add new item
      //check stock
      if (product.stock < 1) {
        throw new Error("Not enough stock available");
      }

      // add item to cart
      cart.items.push(item);
    }

    // ✅ FIX: ALWAYS save updated cart (this is what fixes try/catch behavior)
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as CartItem[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message:
        " " +
        product.name +
        (item.taille ? ` (Size: ${item.taille.toUpperCase()})` : "") +
        " " +
        (existItem ? "quantity increased" : "added to cart"),
    };
  } catch (error) {
    console.log("addItemToCart error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to add item to cart";

    return {
      success: false,
      message,
    };
  }
}

export async function getCartItems() {
  // ✅ cookie
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("No cart session ID found");

  // ✅ auth
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : null;

  // ✅ fetch cart (DB uses sessionId)
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId: sessionCartId },
  });

  if (!cart) return undefined;

  // ✅ return a plain object (safe for Next.js)
  return convertCartToPlainObject(cart);
}

export async function removeItemFromCart(productId: string, taille?: string) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("No cart session ID found");

    // ✅ get product (findUnique is better since id is unique)
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, slug: true },
    });
    if (!product) throw new Error("Product not found");

    // ✅ get cart
    const cart = await getCartItems();
    if (!cart) throw new Error("Cart not found");

    const items = (cart.items as CartItem[]) ?? [];

    // ✅ find item by productId AND taille (if provided)
    const existItem = items.find(
      (x) => x.productId === productId && x.taille === taille,
    );
    if (!existItem) throw new Error("Item not found in cart");

    // ✅ build updated items array (no in-place mutation)
    const updatedItems: CartItem[] =
      existItem.qty > 1
        ? items.map((x) =>
            x.productId === productId && x.taille === taille
              ? { ...x, quantity: x.qty - 1 }
              : x,
          )
        : items.filter(
            (x) => !(x.productId === productId && x.taille === taille),
          );

    const prices = calcPrice(updatedItems);

    // ✅ update DB (items is Json)
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: updatedItems as CartItem[],
        itemsPrice: prices.itemsPrice,
        shippingPrice: prices.shippingPrice,
        totalPrice: prices.totalPrice,
      },
    });

    revalidatePath(`/product/${product.slug}`);
    revalidatePath(`/cart`);

    return {
      success: true,
      message: `Removed from cart ${product.name}${taille ? ` (Size: ${taille.toUpperCase()})` : ""}`,
    };
  } catch (error) {
    console.log("❌ removeItemFromCart error:", error); // ✅ SEE REAL ERROR IN TERMINAL
    return { success: false, message: formatError(error) };
  }
}

export async function saveCartShippingAddress(address: ShippingAddress) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionCartId")?.value; // use your cookie key
    if (!sessionId) throw new Error("No sessionCartId cookie found");

    // 1) find the cart (latest one if duplicates exist)
    const cart = await prisma.cart.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (!cart) throw new Error("Cart not found");

    // 2) update by unique id ✅
    await prisma.cart.update({
      where: { id: cart.id },
      data: { shippingAddress: address },
    });

    return { success: true };
  } catch (e) {
    return { success: false, message: (e as Error).message };
  }
}

export async function getCartCount() {
  const cart = await getCartItems();

  const possibleItems = (cart as unknown as { items?: unknown })?.items;
  const items = Array.isArray(possibleItems)
    ? (possibleItems as unknown[])
    : [];

  // supports qty (order items) or quantity (cart items); defaults to 1 each
  type ItemLike = { qty?: number | string; quantity?: number | string };
  const count = items.reduce((sum: number, item) => {
    const it = item as ItemLike;
    const qty = Number(it.qty ?? it.quantity ?? 1);
    return sum + (Number.isFinite(qty) ? qty : 1);
  }, 0);

  return count;
}
