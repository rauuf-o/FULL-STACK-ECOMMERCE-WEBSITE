import Link from "next/link";
import { EllipsisVertical, ShoppingCart, UserIcon } from "lucide-react";
import { Button } from "../../button";
import Toggle from "./mood-toggle";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../../sheet";
import UserButton from "./user-button";
const Menu = () => {
  return (
    <div className="flex justify-end gap-3">
      {/* Desktop */}
      <nav className="hidden md:flex w-full max-w-xs items-center gap-1">
        <Toggle />

        <Button asChild variant="ghost">
          <Link href="/cart" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Cart</span>
          </Link>
        </Button>

        <UserButton />
      </nav>

      {/* Mobile */}
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="align-middle">
              <EllipsisVertical className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent className="flex flex-col items-start items-center  gap-10">
            <SheetTitle className="mt-10 border-b-4">Menu</SheetTitle>

            <Toggle />

            <Button asChild variant="ghost">
              <Link href="/cart" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
              </Link>
            </Button>

            <UserButton />
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
