import RoomCard from "@/components/RoomCard";
import { supabase } from "@/lib/supabase";

export default async function RoomsPage() {
  const tenant = "thefamilyfunfactory";
  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", tenant)
    .eq("active", true)
    .single();
  const tenantId = tenantRow?.id || "";

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name, description, max_kids, active")
    .eq("tenant_id", tenantId)
    .eq("active", true);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Available Rooms
          </h1>
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

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">
            Load More Rooms
          </button>
        </div>
      </div>
    </div>
  );
}
