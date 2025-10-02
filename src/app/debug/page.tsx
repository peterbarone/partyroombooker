import { samplePackages, sampleRooms, packageRoomMappings } from "@/data/rooms";

export default function DebugPage() {
  const tenant = "thefamilyfunfactory";

  // Test data filtering
  const availablePackages = samplePackages.filter(
    (pkg) => pkg.tenant_id === tenant
  );

  const getAvailableRooms = (packageId: string, kidsCount: number) => {
    const eligibleRoomIds = packageRoomMappings
      .filter((mapping) => mapping.package_id === packageId)
      .map((mapping) => mapping.room_id);

    return sampleRooms.filter(
      (room) =>
        eligibleRoomIds.includes(room.id) &&
        room.max_kids >= kidsCount &&
        room.tenant_id === tenant
    );
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Booking Debug Page</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Tenant: {tenant}</h2>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Available Packages ({availablePackages.length})
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {availablePackages.map((pkg) => (
              <div key={pkg.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{pkg.name}</h3>
                <p className="text-sm text-gray-600">ID: {pkg.id}</p>
                <p className="text-sm text-gray-600">Tenant: {pkg.tenant_id}</p>
                <p className="text-lg font-bold text-blue-600">
                  ${pkg.base_price}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">
            All Rooms ({sampleRooms.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sampleRooms.map((room) => (
              <div key={room.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{room.name}</h3>
                <p className="text-sm text-gray-600">ID: {room.id}</p>
                <p className="text-sm text-gray-600">
                  Tenant: {room.tenant_id}
                </p>
                <p className="text-sm text-gray-600">
                  Max Kids: {room.max_kids}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Package-Room Mappings</h2>
          <div className="space-y-2">
            {packageRoomMappings.map((mapping, index) => (
              <div key={index} className="border rounded p-3">
                <p>
                  Package {mapping.package_id} → Room {mapping.room_id}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Room Tests</h2>
          {availablePackages.map((pkg) => {
            const roomsForPackage = getAvailableRooms(pkg.id, 10); // Test with 10 kids
            return (
              <div key={pkg.id} className="border rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-lg">
                  {pkg.name} (ID: {pkg.id})
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Available rooms for 10 kids:
                </p>
                {roomsForPackage.length === 0 ? (
                  <p className="text-red-600">No rooms available!</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-2">
                    {roomsForPackage.map((room) => (
                      <div
                        key={room.id}
                        className="bg-green-50 border border-green-200 rounded p-2"
                      >
                        <p className="font-medium">{room.name}</p>
                        <p className="text-sm text-gray-600">
                          Max: {room.max_kids} kids
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
