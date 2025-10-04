import RoomCard from "@/components/RoomCard";
import { supabase } from "@/lib/supabase";

export default async function TenantRoomsPage({ params }: any) {
  const tenant = params.tenant;

  // Resolve tenant id from slug
  const { data: tenantRow, error: tenantErr } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", tenant)
    .eq("active", true)
    .single();

  if (tenantErr || !tenantRow?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Tenant not found</h1>
          <p className="text-gray-600 mt-2">Please check the URL.</p>
        </div>
      </div>
    );
  }

  const tenantId = tenantRow.id;

  // Load active rooms for tenant
  const { data: rooms, error: roomsErr } = await supabase
    .from("rooms")
    .select("id, name, description, max_kids, active")
    .eq("tenant_id", tenantId)
    .eq("active", true);

  if (roomsErr) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Error loading rooms</h1>
          <p className="text-gray-600 mt-2">{String(roomsErr.message)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Available Rooms</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse our collection of beautiful party rooms and event spaces
          </p>
        </div>

        {/* Room Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {(rooms || []).map((room) => (
            <RoomCard key={room.id} room={room as any} tenant={tenant} />
          ))}
        </div>
      </div>
    </div>
  );
}
