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

import { User, Phone, Home, MapPin, Store, CreditCard } from "lucide-react";

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
      const cartRes = await saveCartShippingAddress(values);
      if (!cartRes.success) {
        toast.error("Something went wrong", {
          description: cartRes.message || "Failed saving shipping address",
        });
        return;
      }

      if (!isGuest) {
        const userRes = await updateUserAdress(values);
        if (!userRes.success) {
          toast.warning("Saved for this order, but not in your profile");
        }
      }

      router.push("/confirmed");
    });
  };

  return (
    <div className="rounded-2xl border bg-background p-6 shadow-lg max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
        <Home className="h-6 w-6 text-primary" />
        Adresse de livraison
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Choisissez votre mode de livraison et remplissez vos informations.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Delivery Type */}
          <FormField
            control={form.control}
            name="deliveryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" /> Type de livraison
                </FormLabel>
                <FormControl>
                  <select
                    className="h-12 w-full rounded-xl border bg-background px-4 text-sm shadow-sm hover:shadow-md transition"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="HOME">Livraison à domicile</option>
                    <option value="STOP_DESK">Point relais</option>
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
                <FormLabel className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Nom complet
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jean Dupont"
                    {...field}
                    className="rounded-xl border shadow-sm hover:shadow-md transition"
                  />
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
                <FormLabel className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" /> Téléphone
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0550..."
                    {...field}
                    className="rounded-xl border shadow-sm hover:shadow-md transition"
                  />
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
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" /> Wilaya
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Alger"
                        {...field}
                        className="rounded-xl border shadow-sm hover:shadow-md transition"
                      />
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
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" /> Baladiya
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bab Ezzouar"
                        {...field}
                        className="rounded-xl border shadow-sm hover:shadow-md transition"
                      />
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
                    <FormLabel className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-primary" /> Adresse
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rue, immeuble..."
                        {...field}
                        className="rounded-xl border shadow-sm hover:shadow-md transition"
                      />
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
                  <FormLabel className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-primary" /> Point relais
                  </FormLabel>
                  <FormControl>
                    <select
                      className="h-12 w-full rounded-xl border bg-background px-4 text-sm shadow-sm hover:shadow-md transition"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="">Sélectionner un point relais</option>
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

          <Button
            type="submit"
            className="w-full rounded-xl py-4 text-lg font-bold shadow-md hover:shadow-lg transition-all"
          >
            Continuer
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ShippingForm;
