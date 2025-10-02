import { redirect } from "next/navigation";

export default function RootPage() {
  // For demo purposes, redirect to a default tenant
  // In production, this could show a tenant selection page or redirect based on domain
  redirect("/thefamilyfunfactory");
}
