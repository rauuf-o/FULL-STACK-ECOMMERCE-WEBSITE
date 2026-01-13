"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { signInUserWithCredentials } from "@/actions/user.action";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

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
  const [data, action] = useActionState(signInUserWithCredentials, {
    success: false,
    message: "",
  });

  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

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

      {data && !data.success && (
        <p className="text-sm text-red-500 mb-2 text-center">{data.message}</p>
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
