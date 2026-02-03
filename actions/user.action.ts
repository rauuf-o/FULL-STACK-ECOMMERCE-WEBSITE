"use server";
import {
  shippingAddressSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ca } from "zod/v4/locales";
import { success } from "zod";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { redirect } from "next/navigation";
import { formatError } from "@/lib/utils";
import { ShippingAddress } from "@/types";
//sign in with credentials
export async function signInUserWithCredentials(
  prevState: unknown,
  formData: FormData,
) {
  try {
    const user = signInSchema.parse({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
    await signIn("credentials", user);
    redirect((formData.get("callbackUrl") as string) || "/");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: "Invalid email or password" };
  }
}
//sign out user
export async function signOutUser() {
  await signOut();
}
//sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpSchema.parse({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    });
    const plainPassword = user.password;
    const hashedPassword = hashSync(user.password, 12);
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    });
    await signIn("credentials", { email: user.email, password: plainPassword });
    redirect("/");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
}
//get user by ID
export async function getUserByID(userid: string) {
  const user = await prisma.user.findFirst({
    where: { id: userid },
  });
  if (!user) {
    throw new Error("user not found");
  }
  return user;
}
export async function updateUserAdress(data: ShippingAddress) {
  try {
    const Session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: Session?.user.id },
    });
    if (!currentUser) throw new Error("NO USER FOUND");
    const address = shippingAddressSchema.parse(data);
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });
    return {
      success: true,
      message: "user updated succesfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
