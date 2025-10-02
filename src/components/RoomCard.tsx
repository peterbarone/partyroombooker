import { Room, Package } from "@/types";

interface RoomCardProps {
  room: Room;
  packages?: Package[]; // Optional packages to show pricing context
  tenant?: string;
}

export default function RoomCard({ room, packages, tenant }: RoomCardProps) {
  // Get the lowest price package that can use this room
  const lowestPrice =
    packages?.reduce((min, pkg) => {
      return pkg.base_price < min ? pkg.base_price : min;
    }, Infinity) || 0;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <span className="text-white text-lg font-semibold">Room Image</span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
            {room.active ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
          {lowestPrice > 0 && (
            <span className="text-lg font-semibold text-blue-600">
              From ${lowestPrice}
            </span>
          )}
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {room.description || "A wonderful space for your party celebration"}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Up to {room.max_kids} children
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              room.active
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {room.active ? "Available" : "Unavailable"}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Features:</p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              Party Space
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              Setup Included
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              Age Appropriate
            </span>
          </div>
        </div>

        {tenant ? (
          <a
            href={`/${tenant}/book`}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 inline-block text-center"
          >
            Book This Room
          </a>
        ) : (
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
            Select Room
          </button>
        )}
      </div>
    </div>
  );
}
