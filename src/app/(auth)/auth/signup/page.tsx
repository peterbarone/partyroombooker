"use client";

import AuthForm from "@/components/AuthForm";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center">
      <AuthForm mode="signup" />
    </div>
  );
}
