import FamilyFunBookingWizardV2 from "@/components/BookingWizard";

export default function Page({ params }: { params: { tenant: string } }) {
  return <FamilyFunBookingWizardV2 tenant={params.tenant} />;
}
