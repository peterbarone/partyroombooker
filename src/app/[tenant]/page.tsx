import FamilyFunBookingWizardV2 from "@/components/BookingWizard";

export default function Page({ params }: any) {
  const tenant = params?.tenant as string;
  return <FamilyFunBookingWizardV2 tenant={tenant} />;
}
