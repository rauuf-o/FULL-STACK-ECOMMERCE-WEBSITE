"use server";
import { signInSchema } from "@/lib/validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ca } from "zod/v4/locales";
import { success } from "zod";
//sign in with credentials
export async function signInUserWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInSchema.parse({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
    await signIn("credentials", user);
    return { success: true, message: "User signed in successfully" };
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
