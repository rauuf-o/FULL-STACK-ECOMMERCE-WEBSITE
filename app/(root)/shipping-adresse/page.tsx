import React from "react";
import { getCartItems } from "@/actions/cart-action";
import { redirect } from "next/navigation";
import { getUserByID } from "@/actions/user.action";
import { auth } from "@/auth";
import ShippingForm from "./shipping-adress-from";
import { ShippingAddress } from "@/types";
import CheckoutSteps from "@/components/ui/shared/checkout-steps";

const ShippingPage = async () => {
  const cart = await getCartItems();

  // ✅ FIX: length typo
  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const session = await auth();
  const userId = session?.user?.id;

  let address: ShippingAddress | undefined = undefined;

  if (userId) {
    const user = await getUserByID(userId);
    address = (user?.address as ShippingAddress) ?? undefined;
  } else {
    console.log("YOU ARE BUYING AS A GUEST");
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      <CheckoutSteps current={1} />
      <ShippingForm addresse={address} isGuest={!userId} />
    </div>
  );
};

export default ShippingPage;
