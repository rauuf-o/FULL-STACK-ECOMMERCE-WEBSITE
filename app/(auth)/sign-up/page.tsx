import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CredintialsSignUpForm from "./sign-up-form";

export const metadata = {
  title: "Sign Up",
  description: "Sign up for an account",
};

type Props = {
  searchParams: { callbackUrl?: string };
};

export default async function SignUpPage({ searchParams }: Props) {
  const callbackUrl = searchParams?.callbackUrl ?? "/";

  const session = await auth();
  if (session) redirect(callbackUrl);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-4">
            <Link href="/" className="flex justify-center">
              <Image
                src="/images/logo.svg"
                width={100}
                height={100}
                alt="Logo"
                priority
              />
            </Link>

            <CardTitle className="text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">
              Sign up for an account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <CredintialsSignUpForm callbackUrl={callbackUrl} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
