import RoomCard from "@/components/RoomCard";
import { sampleRooms } from "@/data/rooms";

export default function RoomsPage() {
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option>Any size</option>
                <option>Up to 25 guests</option>
                <option>26-50 guests</option>
                <option>51-100 guests</option>
                <option>100+ guests</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option>Any price</option>
                <option>Under $100/hr</option>
                <option>$100-200/hr</option>
                <option>$200-300/hr</option>
                <option>$300+ /hr</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option>All amenities</option>
                <option>DJ Booth</option>
                <option>Bar</option>
                <option>Dance Floor</option>
                <option>Catering Kitchen</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200">
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {sampleRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
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
