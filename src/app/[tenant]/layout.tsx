import type { Metadata } from "next";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: { tenant: string };
}

export async function generateMetadata({
  params,
}: {
  params: { tenant: string };
}): Promise<Metadata> {
  // In a real app, you'd fetch tenant data from the database
  const resolvedParams = await params;
  const tenantName =
    resolvedParams.tenant.charAt(0).toUpperCase() +
    resolvedParams.tenant.slice(1);

  return {
    title: `${tenantName} Party Booking`,
    description: `Book your party at ${tenantName} - Easy online booking for birthday parties and events`,
  };
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const resolvedParams = await params;
  return (
    <div className="min-h-screen">
      {/* Tenant-specific header/branding could go here */}
      <div data-tenant={resolvedParams.tenant}>{children}</div>
    </div>
  );
}
