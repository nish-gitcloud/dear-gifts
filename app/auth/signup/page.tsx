import { Suspense } from "react";
import { AuthForm } from "@/components/creator/AuthForm";

export const metadata = { title: "Create your account — Dear Gifts" };

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
