import FamilyFunBookingWizardV2 from "@/components/BookingWizard";

type PageProps = { params: Promise<{ tenant: string }> };

export default async function Page(props: PageProps) {
  const { tenant } = await props.params;
  return <FamilyFunBookingWizardV2 tenant={tenant} />;
}
