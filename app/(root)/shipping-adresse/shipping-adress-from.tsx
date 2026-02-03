"use client";

import React, { startTransition, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { shippingAddressSchema } from "@/lib/validators";
import { ShippingAddress } from "@/types";
import { updateUserAdress } from "@/actions/user.action";
import { saveCartShippingAddress } from "@/actions/cart-action";

type ShippingFormProps = {
  addresse?: ShippingAddress;
  isGuest: boolean;
};

type ShippingFormData = z.infer<typeof shippingAddressSchema>;

const ShippingForm = ({ addresse, isGuest }: ShippingFormProps) => {
  const router = useRouter();

  const defaultValues = useMemo(() => {
    if (addresse) {
      return addresse as ShippingFormData;
    }

    return {
      deliveryType: "HOME" as const,
      fullName: "",
      phoneNumber: "",
      wilaya: "",
      baladiya: "",
      address: "",
      stopDeskId: "",
    } as ShippingFormData;
  }, [addresse]);

  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const deliveryType = form.watch("deliveryType");

  const onSubmit: SubmitHandler<ShippingFormData> = async (values) => {
    startTransition(async () => {
      // ✅ Save address for BOTH guest and logged-in users (in cart)
      const cartRes = await saveCartShippingAddress(values);
      if (!cartRes.success) {
        toast.error("Something went wrong", {
          description: cartRes.message || "Failed saving shipping address",
        });
        return;
      }

      // ✅ If logged in, also save in user profile (optional but nice UX)
      if (!isGuest) {
        const userRes = await updateUserAdress(values);
        if (!userRes.success) {
          // not blocking checkout, but you can choose to block if you want
          toast.warning("Saved for this order, but not in your profile");
        }
      }

      router.push("/confirmed");
    });
  };

  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm">
      <h1 className="text-lg font-semibold">Shipping Address</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose delivery type and fill your information.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Delivery Type */}
          <FormField
            control={form.control}
            name="deliveryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Type</FormLabel>
                <FormControl>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="HOME">Home Delivery</option>
                    <option value="STOP_DESK">Stop Desk</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="0550..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* HOME fields */}
          {deliveryType === "HOME" && (
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="wilaya"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wilaya</FormLabel>
                    <FormControl>
                      <Input placeholder="Alger" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baladiya"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Baladiya</FormLabel>
                    <FormControl>
                      <Input placeholder="Bab Ezzouar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street, building..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* STOP DESK fields */}
          {deliveryType === "STOP_DESK" && (
            <FormField
              control={form.control}
              name="stopDeskId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stop Desk</FormLabel>
                  <FormControl>
                    <select
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="">Select stop desk</option>
                      <option value="alger-centre">Alger Centre</option>
                      <option value="oran-centre">Oran Centre</option>
                      <option value="setif-centre">Sétif Centre</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button type="submit" className="w-full rounded-xl">
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ShippingForm;
