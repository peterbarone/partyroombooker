import { Room, Package } from "@/types";

interface RoomCardProps {
  room: Room;
  packages?: Package[]; // Optional packages to show pricing context
  tenant?: string;
}

// Fun room icons mapping
const getRoomIcon = (roomName: string) => {
  if (roomName.toLowerCase().includes("party")) return "🎉";
  if (roomName.toLowerCase().includes("sports")) return "⚽";
  if (roomName.toLowerCase().includes("craft")) return "🎨";
  if (roomName.toLowerCase().includes("dance")) return "💃";
  if (roomName.toLowerCase().includes("arcade")) return "🕹️";
  return "🏰";
};

// Fun gradient backgrounds for rooms
const getRoomGradient = (index: number) => {
  const gradients = [
    "from-pink-400 via-purple-500 to-blue-500",
    "from-yellow-400 via-orange-500 to-red-500",
    "from-green-400 via-blue-500 to-purple-500",
    "from-purple-400 via-pink-500 to-red-500",
    "from-blue-400 via-teal-500 to-green-500",
  ];
  return gradients[index % gradients.length];
};

export default function RoomCard({ room, packages, tenant }: RoomCardProps) {
  // Get the lowest price package that can use this room
  const lowestPrice =
    packages?.reduce((min, pkg) => {
      return pkg.base_price < min ? pkg.base_price : min;
    }, Infinity) || 0;

  const roomIcon = getRoomIcon(room.name);
  const gradient = getRoomGradient(parseInt(room.id.slice(-1)) || 0);

  return (
    <div className="card-party group relative overflow-hidden">
      {/* Floating balloons decoration */}
      <div className="absolute top-2 left-2 z-10">
        <div className="balloon bg-pink-400 w-4 h-5 animate-float opacity-70" />
      </div>
      <div className="absolute top-3 right-8 z-10">
        <div
          className="balloon bg-blue-400 w-3 h-4 animate-float opacity-70"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Room Image/Header */}
      <div
        className={`h-48 bg-gradient-to-br ${gradient} relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-party-pattern opacity-20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-2 group-hover:animate-bounce-fun">
              {roomIcon}
            </div>
            <span className="text-lg font-party font-bold drop-shadow-lg">
              {room.name}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold font-playful ${
              room.active
                ? "bg-green-400 text-white animate-pulse shadow-lg"
                : "bg-gray-400 text-white"
            }`}
          >
            {room.active ? "🌟 Available!" : "😴 Coming Soon"}
          </span>
        </div>

        {/* Price Badge */}
        {lowestPrice > 0 && (
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 border-2 border-yellow-300">
              <span className="text-lg font-bold text-purple-600 font-party">
                From ${lowestPrice}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 relative">
        {/* Confetti decoration */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
          <div
            className="confetti-piece bg-pink-300 w-2 h-2"
            style={{ top: "10%", left: "80%", animationDelay: "0s" }}
          />
          <div
            className="confetti-piece bg-yellow-300 w-2 h-2"
            style={{ top: "30%", left: "90%", animationDelay: "1s" }}
          />
          <div
            className="confetti-piece bg-blue-300 w-2 h-2"
            style={{ top: "50%", left: "85%", animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10">
          <p className="text-gray-700 mb-4 font-playful text-lg leading-relaxed">
            {room.description ||
              "A magical space where dreams come true and parties become unforgettable memories! ✨"}
          </p>

          {/* Fun Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-3 text-center border-2 border-pink-200">
              <div className="text-2xl font-bold text-purple-600 font-party">
                {room.max_kids}
              </div>
              <div className="text-xs font-playful text-gray-600">
                Party Friends! 👫
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-3 text-center border-2 border-yellow-200">
              <div className="text-2xl font-bold text-orange-600 font-party">
                ⭐⭐⭐⭐⭐
              </div>
              <div className="text-xs font-playful text-gray-600">
                Fun Rating!
              </div>
            </div>
          </div>

          {/* Fun Features */}
          <div className="mb-6">
            <p className="text-sm font-party text-purple-600 mb-3 flex items-center">
              🎪 What Makes This Room Special:
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-gradient-to-r from-pink-200 to-purple-200 text-purple-700 px-3 py-1 rounded-full font-playful border border-purple-300">
                🎈 Party Ready Space
              </span>
              <span className="text-xs bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-700 px-3 py-1 rounded-full font-playful border border-orange-300">
                🎯 All Setup Included
              </span>
              <span className="text-xs bg-gradient-to-r from-blue-200 to-green-200 text-green-700 px-3 py-1 rounded-full font-playful border border-green-300">
                🌟 Age Perfect Fun
              </span>
              <span className="text-xs bg-gradient-to-r from-purple-200 to-pink-200 text-pink-700 px-3 py-1 rounded-full font-playful border border-pink-300">
                🎊 Memory Making
              </span>
            </div>
          </div>

          {/* Action Button */}
          {tenant ? (
            <a
              href={`/${tenant}/book`}
              className="btn-party w-full text-center font-party text-lg group-hover:animate-pulse-party"
            >
              🚀 Book This Awesome Room! 🚀
            </a>
          ) : (
            <button className="btn-celebration w-full font-party text-lg group-hover:animate-pulse-party">
              🎯 Choose This Room! 🎯
            </button>
          )}

          {/* Fun call-to-action text */}
          <p className="text-center text-xs font-playful text-gray-500 mt-3 italic">
            "Where every celebration becomes magical!" ✨
          </p>
        </div>
      </div>

      {/* Hover effect border */}
      <div className="absolute inset-0 border-4 border-transparent group-hover:border-yellow-300 rounded-3xl transition-all duration-300 pointer-events-none"></div>
    </div>
  );
}
