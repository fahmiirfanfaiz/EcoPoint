import { Suspense } from "react";
import AuthPage from "@/components/auth/AuthPage";

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthPage mode="register" />
    </Suspense>
  );
}
