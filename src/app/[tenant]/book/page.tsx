// Family Fun Factory Booking Experience
import FamilyFunBookingWizard from "../../../components/FamilyFunBookingWizard";

interface BookingPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const resolvedParams = await params;
  return (
    <FamilyFunBookingWizard tenant={resolvedParams.tenant} />
  );
}
