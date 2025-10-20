import FamilyFunBookingWizardV2 from "@/components/BookingWizard";

export default async function Page({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  return <FamilyFunBookingWizardV2 tenant={tenant} />;
}
