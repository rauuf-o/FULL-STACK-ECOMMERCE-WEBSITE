export const dynamic = "force-dynamic";

import React from "react";
import CartTable from "./cart-table";
import { getCartItems } from "@/actions/cart-action";
export const metadata = {
  title: "Cart - NextJS Ecom",
  description: "Your shopping cart",
};

const CartPage = async () => {
  const cart = await getCartItems();
  return (
    <div>
      <CartTable cart={cart}></CartTable>
    </div>
  );
};

export default CartPage;
