import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/features/auth";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join AI Cafe for fast ordering and rewards"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
