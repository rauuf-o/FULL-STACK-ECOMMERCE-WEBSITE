"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { signInUserWithCredentials, signUpUser } from "@/actions/user.action";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

function SignUpButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full mb-4" variant="default" disabled={pending}>
      {pending ? "Signing Up..." : "Sign Up"}
    </Button>
  );
}

export default function CredintialsSignUpForm({
  callbackUrl,
}: {
  callbackUrl: string;
}) {
  const [data, action] = useActionState(signUpUser, {
    success: false,
    message: "",
  });

  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className="space-y-6">
        <div>
          <Label htmlFor="email" className="mb-4">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            defaultValue={signUpDefaultValues.name}
          />
        </div>

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
            defaultValue={signUpDefaultValues.email}
          />
        </div>
        <div className="space-y-6">
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
              defaultValue={signUpDefaultValues.password}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="mb-4">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="confirm-password"
              defaultValue={signUpDefaultValues.confirmPassword}
            />
          </div>

          <SignUpButton />
        </div>
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
