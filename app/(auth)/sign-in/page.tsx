import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import CredintialsSigninForm from "./credentials-signin";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SearchParams } from "next/dist/server/request/search-params";
export const metadata = {
  title: "Sign In ",
  description: "Sign in to your account",
};
const SignInPage = async (props: {
  searchParams: Promise<{ callbackUrl: string }>;
}) => {
  const { callbackUrl } = await props.searchParams;

  const session = await auth();
  if (session) {
    redirect(callbackUrl || "/");
  }
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

            <CardTitle className="text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <CredintialsSigninForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignInPage;
