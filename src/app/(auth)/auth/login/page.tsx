"use client";

import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center">
      <AuthForm mode="signin" />
    </div>
  );
}
