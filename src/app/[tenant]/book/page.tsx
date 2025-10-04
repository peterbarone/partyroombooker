// Family Fun Factory Booking Experience
import FamilyFunBookingWizard from "../../../components/FamilyFunBookingWizard";

export default function BookingPage({ params }: { params: { tenant: string } }) {
  return <FamilyFunBookingWizard tenant={params.tenant} />;
}
