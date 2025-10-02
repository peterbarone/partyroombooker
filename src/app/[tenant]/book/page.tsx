// Ensure the BookingWizard component exists at the correct path.
// If the file is actually at "src/components/BookingWizard.tsx", update the import as follows:
import BookingWizard from "../../../components/BookingWizard";

interface BookingPageProps {
  params: { tenant: string };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const resolvedParams = await params;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book Your Party
          </h1>
          <p className="text-gray-600">
            Follow the steps below to book your perfect party
          </p>
        </div>

        <BookingWizard tenant={resolvedParams.tenant} />
      </div>
    </div>
  );
}
