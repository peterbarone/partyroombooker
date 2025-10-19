"use client";

// Family Fun Factory Booking Experience
import FamilyFunBookingWizard from "../../../components/BookingWizard";
import { useParams } from "next/navigation";

export default function BookingPage() {
  const params = useParams<{ tenant: string }>();
  const tenant = (params?.tenant as string) || "";
  return <FamilyFunBookingWizard tenant={tenant} />;
}
