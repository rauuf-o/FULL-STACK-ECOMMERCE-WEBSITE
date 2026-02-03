"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function SignInButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full mb-4" variant="default" disabled={pending}>
      {pending ? "Signing In..." : "Sign In"}
    </Button>
  );
}

export default function CredintialsSigninForm({
  callbackUrl,
}: {
  callbackUrl: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  async function onSubmit(formData: FormData) {
    setError("");

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // we handle navigation ourselves
      callbackUrl,
    });

    if (!res?.ok) {
      setError("Invalid email or password");
      return;
    }

    // ✅ this updates the UI instantly
    router.refresh();
    router.push(callbackUrl);
  }

  return (
    <form action={onSubmit}>
      <div className="space-y-6">
        <div>
          <Label htmlFor="email" className="mb-4">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={signInDefaultValues.email}
          />
        </div>

        <div>
          <Label htmlFor="password" className="mb-4">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            defaultValue={signInDefaultValues.password}
          />
        </div>

        <SignInButton />
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-2 text-center">{error}</p>
      )}

      <div className="text-sm text-center text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-blue-500 hover:underline">
          Sign Up
        </Link>
      </div>
    </form>
  );
}
