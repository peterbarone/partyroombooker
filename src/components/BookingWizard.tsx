"use client";

import { useState } from "react";
import {
  samplePackages,
  sampleRooms,
  sampleAddons,
  packageRoomMappings,
} from "@/data/rooms";
import {
  Package,
  Room,
  Addon,
  AvailabilitySlot,
  PriceCalculation,
} from "@/types";

interface BookingWizardProps {
  tenant: string;
}

interface BookingState {
  step: number;
  selectedDate: string;
  selectedPackage: Package | null;
  kidsCount: number;
  selectedTime: string;
  selectedRoom: Room | null;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  selectedAddons: Array<{ addon: Addon; quantity: number }>;
  paymentStatus: "pending" | "processing" | "completed" | "failed";
  paymentId?: string;
}

export default function BookingWizard({ tenant }: BookingWizardProps) {
  const [booking, setBooking] = useState<BookingState>({
    step: 1,
    selectedDate: "",
    selectedPackage: null,
    kidsCount: 1,
    selectedTime: "",
    selectedRoom: null,
    customerInfo: {
      name: "",
      email: "",
      phone: "",
    },
    selectedAddons: [],
    paymentStatus: "pending",
  });

  const [showDebug, setShowDebug] = useState(false);

  const availablePackages = samplePackages.filter(
    (pkg) => pkg.tenant_id === tenant
  );

  const calculatePrice = (): PriceCalculation => {
    if (!booking.selectedPackage) {
      return {
        base_price: 0,
        extra_kids_price: 0,
        addons_price: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        deposit_amount: 0,
        balance_amount: 0,
      };
    }

    const basePrice = booking.selectedPackage.base_price;
    const extraKids = Math.max(
      0,
      booking.kidsCount - booking.selectedPackage.base_kids
    );
    const extraKidsPrice = extraKids * booking.selectedPackage.extra_kid_price;

    const addonsPrice = booking.selectedAddons.reduce((total, item) => {
      return total + item.addon.price * item.quantity;
    }, 0);

    const subtotal = basePrice + extraKidsPrice + addonsPrice;
    const taxRate = 0.0875; // 8.75% NY State sales tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const depositAmount = total * 0.5; // 50% deposit
    const balanceAmount = total - depositAmount;

    return {
      base_price: basePrice,
      extra_kids_price: extraKidsPrice,
      addons_price: addonsPrice,
      subtotal,
      tax,
      total,
      deposit_amount: depositAmount,
      balance_amount: balanceAmount,
    };
  };

  const processPayment = async (amount: number, type: "deposit" | "full") => {
    setBooking((prev) => ({ ...prev, paymentStatus: "processing" }));

    try {
      const pricing = calculatePrice();
      const paymentAmount =
        type === "deposit" ? pricing.deposit_amount : pricing.total;

      // Create line items for Clover
      const lineItems = [];

      if (booking.selectedPackage) {
        lineItems.push({
          name: booking.selectedPackage.name,
          price: Math.round(booking.selectedPackage.base_price * 100), // Convert to cents
          quantity: 1,
          unitQty: "1",
        });
      }

      // Add extra kids if any
      if (pricing.extra_kids_price > 0) {
        const extraKids =
          booking.kidsCount - (booking.selectedPackage?.base_kids || 0);
        lineItems.push({
          name: `Extra Children (${extraKids})`,
          price: Math.round(pricing.extra_kids_price * 100),
          quantity: 1,
          unitQty: "1",
        });
      }

      // Add addons
      booking.selectedAddons.forEach((item) => {
        lineItems.push({
          name: item.addon.name,
          price: Math.round(item.addon.price * 100),
          quantity: item.quantity,
          unitQty: item.addon.unit,
        });
      });

      // Add tax
      lineItems.push({
        name: "Sales Tax (8.75%)",
        price: Math.round(pricing.tax * 100),
        quantity: 1,
        unitQty: "1",
      });

      // If paying deposit only, adjust the total
      if (type === "deposit") {
        lineItems.push({
          name: "Deposit (50%)",
          price: -Math.round((pricing.total - pricing.deposit_amount) * 100), // Negative to reduce total
          quantity: 1,
          unitQty: "1",
        });
      }

      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenant,
          customer: {
            email: booking.customerInfo.email,
            firstName: booking.customerInfo.name.split(" ")[0],
            lastName:
              booking.customerInfo.name.split(" ").slice(1).join(" ") || "",
          },
          lineItems,
          amount: Math.round(paymentAmount * 100),
          bookingData: {
            date: booking.selectedDate,
            time: booking.selectedTime,
            package: booking.selectedPackage?.name,
            room: booking.selectedRoom?.name,
            kidsCount: booking.kidsCount,
            addons: booking.selectedAddons,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Clover checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Payment processing failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setBooking((prev) => ({ ...prev, paymentStatus: "failed" }));
      alert("Payment processing failed. Please try again.");
    }
  };

  const nextStep = () => {
    if (booking.step < 4) {
      setBooking({ ...booking, step: booking.step + 1 });
    }
  };

  const prevStep = () => {
    if (booking.step > 1) {
      setBooking({ ...booking, step: booking.step - 1 });
    }
  };

  const updatePackage = (pkg: Package) => {
    setBooking({
      ...booking,
      selectedPackage: pkg,
      selectedRoom: null, // Reset room when package changes
    });
  };

  const updateRoom = (room: Room) => {
    setBooking({ ...booking, selectedRoom: room });
  };

  const updateAddon = (addon: Addon, quantity: number) => {
    const existingIndex = booking.selectedAddons.findIndex(
      (item) => item.addon.id === addon.id
    );

    if (quantity === 0) {
      // Remove addon
      setBooking({
        ...booking,
        selectedAddons: booking.selectedAddons.filter(
          (item) => item.addon.id !== addon.id
        ),
      });
    } else if (existingIndex >= 0) {
      // Update existing addon
      const newAddons = [...booking.selectedAddons];
      newAddons[existingIndex].quantity = quantity;
      setBooking({ ...booking, selectedAddons: newAddons });
    } else {
      // Add new addon
      setBooking({
        ...booking,
        selectedAddons: [...booking.selectedAddons, { addon, quantity }],
      });
    }
  };

  const renderStep1 = () => {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-pink-200 relative overflow-hidden">
        {/* Fun background elements */}
        <div className="absolute top-4 right-6 w-12 h-12 bg-yellow-200 rounded-full opacity-30 animate-bounce-fun"></div>
        <div className="absolute bottom-6 left-8 w-8 h-8 bg-pink-200 rounded-full opacity-30 animate-wiggle"></div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-party font-bold text-purple-700 mb-2">
            🎪 Choose Your Perfect Party Package!
          </h2>
          <p className="text-gray-600 font-playful text-lg">
            Pick the amazing package and when you want to celebrate! 🎉✨
          </p>
        </div>

        <div className="space-y-8">
          {/* Package Selection */}
          <div>
            <h3 className="text-xl font-party font-bold text-purple-700 mb-6 flex items-center">
              🎁 Select Your Amazing Package
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => updatePackage(pkg)}
                  className={`border-3 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    booking.selectedPackage?.id === pkg.id
                      ? "border-pink-400 bg-gradient-to-br from-pink-50 to-purple-50 shadow-xl scale-105"
                      : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg"
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🎉</div>
                    <h4 className="text-xl font-party font-bold text-purple-700">
                      {pkg.name}
                    </h4>
                    <p className="text-gray-600 font-playful mt-2">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-party font-bold text-green-600 mb-1">
                      ${pkg.base_price}
                    </div>
                    <p className="text-purple-600 font-playful font-bold">
                      for {pkg.base_kids} amazing kids! 🎈
                    </p>
                    <p className="text-sm text-gray-500 mt-1 font-playful">
                      ${pkg.extra_kid_price} per extra little party guest
                    </p>
                  </div>

                  {booking.selectedPackage?.id === pkg.id && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl border-2 border-pink-300">
                      <p className="text-center text-pink-700 font-party font-bold">
                        🌟 Fantastic Choice! This will be AMAZING! 🌟
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          {booking.selectedPackage && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-3 border-blue-200">
              <h3 className="text-xl font-party font-bold text-blue-700 mb-4 flex items-center">
                📅 When is the Big Celebration?
              </h3>
              <input
                type="date"
                value={booking.selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setBooking({ ...booking, selectedDate: e.target.value })
                }
                className="w-full p-4 border-3 border-pink-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 font-playful text-lg"
              />
            </div>
          )}

          {/* Kids Count */}
          {booking.selectedPackage && booking.selectedDate && (
            <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-2xl p-6 border-3 border-green-200">
              <h3 className="text-xl font-party font-bold text-green-700 mb-4 flex items-center">
                👶 How Many Little Party Stars?
              </h3>
              <div className="flex items-center justify-center space-x-6">
                <button
                  onClick={() =>
                    setBooking({
                      ...booking,
                      kidsCount: Math.max(1, booking.kidsCount - 1),
                    })
                  }
                  className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white text-2xl font-bold rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="text-4xl font-party font-bold text-purple-700">
                    {booking.kidsCount}
                  </span>
                  <p className="text-purple-600 font-playful font-bold">
                    party kids! 🎉
                  </p>
                </div>
                <button
                  onClick={() =>
                    setBooking({
                      ...booking,
                      kidsCount: booking.kidsCount + 1,
                    })
                  }
                  className="w-12 h-12 bg-gradient-to-br from-blue-400 to-green-400 hover:from-blue-500 hover:to-green-500 text-white text-2xl font-bold rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
                >
                  +
                </button>
              </div>
              {booking.kidsCount > booking.selectedPackage.base_kids && (
                <div className="mt-4 p-4 bg-white rounded-xl border-2 border-green-300">
                  <p className="text-center text-green-700 font-playful">
                    🌟 Extra party stars:{" "}
                    {booking.kidsCount - booking.selectedPackage.base_kids} × $
                    {booking.selectedPackage.extra_kid_price} = $
                    {(booking.kidsCount - booking.selectedPackage.base_kids) *
                      booking.selectedPackage.extra_kid_price}{" "}
                    🌟
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Time Selection */}
          {booking.selectedPackage && booking.selectedDate && (
            <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl p-6 border-3 border-pink-200">
              <h3 className="text-xl font-party font-bold text-pink-700 mb-4 flex items-center">
                ⏰ What Time Should the Fun Begin?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "10:00 AM",
                  "11:00 AM",
                  "12:00 PM",
                  "1:00 PM",
                  "2:00 PM",
                  "3:00 PM",
                  "4:00 PM",
                  "5:00 PM",
                ].map((time) => (
                  <button
                    key={time}
                    onClick={() =>
                      setBooking({ ...booking, selectedTime: time })
                    }
                    className={`py-3 px-4 rounded-xl font-party font-bold transition-all duration-300 transform hover:scale-105 ${
                      booking.selectedTime === time
                        ? "bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 text-white shadow-lg scale-105"
                        : "bg-white border-3 border-pink-200 text-purple-700 hover:border-purple-400 hover:shadow-md"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t-3 border-pink-200">
          <div className="flex items-center space-x-2">
            <span className="text-2xl animate-bounce-fun">🎈</span>
            <span className="text-gray-500 font-playful">Step 1 of 4</span>
          </div>
          <button
            onClick={nextStep}
            disabled={
              !booking.selectedPackage ||
              !booking.selectedDate ||
              !booking.selectedTime
            }
            className={`px-8 py-4 rounded-xl font-party font-bold text-lg transition-all duration-300 transform ${
              !booking.selectedPackage ||
              !booking.selectedDate ||
              !booking.selectedTime
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-400 to-purple-400 text-white hover:from-blue-500 hover:to-purple-500 hover:scale-105 shadow-lg hover:shadow-xl animate-pulse-party"
            }`}
          >
            Next: Choose Room! 🏰 →
          </button>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    if (!booking.selectedPackage) return null;

    // Get eligible room IDs for the selected package
    const packageMappings = packageRoomMappings.filter(
      (mapping) => mapping.package_id === booking.selectedPackage?.id
    );
    const eligibleRoomIds = packageMappings.map((mapping) => mapping.room_id);

    const availableRooms = sampleRooms.filter(
      (room) =>
        eligibleRoomIds.includes(room.id) &&
        room.tenant_id === tenant &&
        room.active
    );

    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-blue-200 relative overflow-hidden">
        {/* Fun background elements */}
        <div className="absolute top-6 right-8 w-16 h-16 bg-blue-200 rounded-full opacity-30 animate-float"></div>
        <div className="absolute bottom-8 left-6 w-10 h-10 bg-purple-200 rounded-full opacity-30 animate-wiggle"></div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-party font-bold text-blue-700 mb-2">
            🏰 Choose Your Perfect Party Palace!
          </h2>
          <p className="text-gray-600 font-playful text-lg">
            Pick the magical space where your celebration will happen! ✨🎪
          </p>
        </div>

        {/* Debug info */}
        <div className="mb-6">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-sm text-blue-600 hover:text-blue-800 font-playful px-3 py-1 bg-blue-50 rounded-full border border-blue-200 transition-all duration-300 hover:bg-blue-100"
          >
            {showDebug ? "Hide" : "Show"} Debug Info 🔍
          </button>
          {showDebug && (
            <div className="mt-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200">
              <h3 className="font-party font-bold text-gray-700 mb-3">
                🔧 System Info
              </h3>
              <div className="text-sm font-playful space-y-1 text-gray-600">
                <p>
                  <strong>Selected Package:</strong>{" "}
                  {booking.selectedPackage?.name} (ID:{" "}
                  {booking.selectedPackage?.id})
                </p>
                <p>
                  <strong>Tenant:</strong> {tenant}
                </p>
                <p>
                  <strong>Package Mappings:</strong>{" "}
                  {JSON.stringify(packageMappings)}
                </p>
                <p>
                  <strong>Eligible Room IDs:</strong>{" "}
                  {JSON.stringify(eligibleRoomIds)}
                </p>
                <p>
                  <strong>Total Rooms in System:</strong> {sampleRooms.length}
                </p>
                <p>
                  <strong>Filtered Rooms:</strong> {availableRooms.length}
                </p>
              </div>
            </div>
          )}
        </div>

        {availableRooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-party font-bold text-purple-700 mb-2">
              Oops! No Rooms Available
            </h3>
            <p className="text-gray-600 font-playful text-lg mb-6">
              No magical spaces are available for this package right now. Our
              party experts would love to help you find the perfect solution!
            </p>
            <button className="bg-gradient-to-r from-pink-400 to-purple-400 text-white font-party font-bold py-3 px-6 rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105">
              📞 Contact Our Party Experts
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {availableRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => updateRoom(room)}
                className={`border-3 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  booking.selectedRoom?.id === room.id
                    ? "border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl scale-105"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg"
                }`}
              >
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">🏰</div>
                  <h4 className="text-xl font-party font-bold text-blue-700">
                    {room.name}
                  </h4>
                  <p className="text-gray-600 font-playful mt-2 leading-relaxed">
                    {room.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-200">
                    <span className="text-xl">👥</span>
                    <span className="font-party font-bold text-green-700">
                      Perfect for up to {room.max_kids} party kids!
                    </span>
                  </div>
                </div>

                {booking.selectedRoom?.id === room.id && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border-2 border-blue-300">
                    <div className="text-center">
                      <p className="text-blue-700 font-party font-bold mb-2">
                        🎉 Excellent Choice! This room is PERFECT! 🎉
                      </p>
                      <div className="flex justify-center space-x-2">
                        <span className="text-xl animate-bounce-fun">🎈</span>
                        <span
                          className="text-xl animate-bounce-fun"
                          style={{ animationDelay: "0.2s" }}
                        >
                          🎊
                        </span>
                        <span
                          className="text-xl animate-bounce-fun"
                          style={{ animationDelay: "0.4s" }}
                        >
                          ✨
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t-3 border-blue-200">
          <button
            onClick={prevStep}
            className="px-8 py-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-party font-bold text-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ← Back to Package
          </button>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl animate-bounce-fun">🎪</span>
              <span className="text-gray-500 font-playful">Step 2 of 4</span>
            </div>
            <button
              onClick={nextStep}
              disabled={!booking.selectedRoom}
              className={`px-8 py-4 rounded-xl font-party font-bold text-lg transition-all duration-300 transform ${
                !booking.selectedRoom
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:from-purple-500 hover:to-pink-500 hover:scale-105 shadow-lg hover:shadow-xl animate-pulse-party"
              }`}
            >
              Next: Add Fun Extras! ✨ →
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const availableAddons = sampleAddons.filter(
      (addon) => addon.tenant_id === tenant && addon.active
    );

    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-200 relative overflow-hidden">
        {/* Fun background elements */}
        <div className="absolute top-8 right-10 w-14 h-14 bg-green-200 rounded-full opacity-30 animate-wiggle"></div>
        <div className="absolute bottom-10 left-12 w-10 h-10 bg-yellow-200 rounded-full opacity-30 animate-float"></div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-party font-bold text-green-700 mb-2">
            ✨ Add Magical Extras & Your Info!
          </h2>
          <p className="text-gray-600 font-playful text-lg">
            Make your party even more amazing with fun add-ons! 🎪🎈
          </p>
        </div>

        <div className="space-y-8">
          {/* Add-ons Section */}
          <div>
            <h3 className="text-xl font-party font-bold text-green-700 mb-6 flex items-center">
              🎭 Optional Fun Add-ons
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {availableAddons.map((addon) => {
                const currentQuantity =
                  booking.selectedAddons.find(
                    (item) => item.addon.id === addon.id
                  )?.quantity || 0;

                return (
                  <div
                    key={addon.id}
                    className="border-3 border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-white to-green-50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-2">🎪</span>
                          <h4 className="text-lg font-party font-bold text-green-700">
                            {addon.name}
                          </h4>
                        </div>
                        <p className="text-gray-600 font-playful leading-relaxed">
                          {addon.description}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-2xl font-party font-bold text-green-600">
                          ${addon.price}
                        </span>
                        <p className="text-sm text-gray-500 font-playful">
                          {addon.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-green-200">
                      <span className="font-party font-bold text-green-700">
                        Add to party? 🎉
                      </span>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            updateAddon(addon, Math.max(0, currentQuantity - 1))
                          }
                          className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white text-xl font-bold rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-md"
                        >
                          -
                        </button>
                        <span className="w-12 text-center text-xl font-party font-bold text-purple-700">
                          {currentQuantity}
                        </span>
                        <button
                          onClick={() =>
                            updateAddon(addon, currentQuantity + 1)
                          }
                          className="w-10 h-10 bg-gradient-to-br from-blue-400 to-green-400 hover:from-blue-500 hover:to-green-500 text-white text-xl font-bold rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-md"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-3 border-purple-200">
            <h3 className="text-xl font-party font-bold text-purple-700 mb-6 flex items-center">
              👑 Tell Us About the Party Host!
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-lg font-party font-bold text-purple-700">
                  🎭 Your Amazing Name
                </label>
                <input
                  type="text"
                  value={booking.customerInfo.name}
                  onChange={(e) =>
                    setBooking({
                      ...booking,
                      customerInfo: {
                        ...booking.customerInfo,
                        name: e.target.value,
                      },
                    })
                  }
                  className="w-full p-4 border-3 border-pink-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 font-playful text-lg"
                  placeholder="The fantastic party host's name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-lg font-party font-bold text-purple-700">
                  📧 Email Address
                </label>
                <input
                  type="email"
                  value={booking.customerInfo.email}
                  onChange={(e) =>
                    setBooking({
                      ...booking,
                      customerInfo: {
                        ...booking.customerInfo,
                        email: e.target.value,
                      },
                    })
                  }
                  className="w-full p-4 border-3 border-pink-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 font-playful text-lg"
                  placeholder="your.awesome.email@example.com"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-lg font-party font-bold text-purple-700">
                  📞 Phone Number
                </label>
                <input
                  type="tel"
                  value={booking.customerInfo.phone}
                  onChange={(e) =>
                    setBooking({
                      ...booking,
                      customerInfo: {
                        ...booking.customerInfo,
                        phone: e.target.value,
                      },
                    })
                  }
                  className="w-full p-4 border-3 border-pink-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 font-playful text-lg"
                  placeholder="(555) 123-4567"
                />
                <p className="text-sm text-purple-600 font-playful">
                  📱 We&apos;ll only call with exciting party updates!
                </p>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-2xl p-6 border-4 border-blue-300">
            <h3 className="text-xl font-party font-bold text-blue-700 mb-6 flex items-center">
              💰 Your Amazing Party Investment!
            </h3>
            {(() => {
              const pricing = calculatePrice();
              return (
                <div className="space-y-3 text-lg font-playful">
                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border-2 border-blue-200">
                    <span className="flex items-center">
                      <span className="text-xl mr-2">🎉</span>
                      Base Package:
                    </span>
                    <span className="font-party font-bold text-green-600">
                      ${pricing.base_price.toFixed(2)}
                    </span>
                  </div>
                  {pricing.extra_kids_price > 0 && (
                    <div className="flex justify-between items-center p-3 bg-white rounded-xl border-2 border-blue-200">
                      <span className="flex items-center">
                        <span className="text-xl mr-2">👶</span>
                        Extra Party Stars:
                      </span>
                      <span className="font-party font-bold text-green-600">
                        ${pricing.extra_kids_price.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {pricing.addons_price > 0 && (
                    <div className="flex justify-between items-center p-3 bg-white rounded-xl border-2 border-blue-200">
                      <span className="flex items-center">
                        <span className="text-xl mr-2">✨</span>
                        Fun Add-ons:
                      </span>
                      <span className="font-party font-bold text-green-600">
                        ${pricing.addons_price.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border-2 border-blue-200">
                    <span className="flex items-center">
                      <span className="text-xl mr-2">🧮</span>
                      Subtotal:
                    </span>
                    <span className="font-party font-bold text-blue-600">
                      ${pricing.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border-2 border-blue-200">
                    <span className="flex items-center">
                      <span className="text-xl mr-2">📊</span>
                      Tax (8.75%):
                    </span>
                    <span className="font-party font-bold text-blue-600">
                      ${pricing.tax.toFixed(2)}
                    </span>
                  </div>

                  <div className="h-1 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 rounded-full my-4"></div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-3 border-green-300">
                    <span className="flex items-center text-xl">
                      <span className="text-2xl mr-2">🎊</span>
                      <span className="font-party font-bold text-green-700">
                        Total Party Cost:
                      </span>
                    </span>
                    <span className="text-3xl font-party font-bold text-green-600">
                      ${pricing.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="flex justify-between items-center p-3 bg-yellow-100 rounded-xl border-2 border-yellow-300">
                      <span className="flex items-center">
                        <span className="text-xl mr-2">💳</span>
                        <span className="font-party font-bold text-yellow-700">
                          Deposit (50%):
                        </span>
                      </span>
                      <span className="font-party font-bold text-yellow-600">
                        ${pricing.deposit_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-100 rounded-xl border-2 border-orange-300">
                      <span className="flex items-center">
                        <span className="text-xl mr-2">🎈</span>
                        <span className="font-party font-bold text-orange-700">
                          Pay at Party:
                        </span>
                      </span>
                      <span className="font-party font-bold text-orange-600">
                        ${pricing.balance_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t-3 border-green-200">
          <button
            onClick={prevStep}
            className="px-8 py-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-party font-bold text-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ← Back to Rooms
          </button>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl animate-wiggle">✨</span>
              <span className="text-gray-500 font-playful">Step 3 of 4</span>
            </div>
            <button
              onClick={nextStep}
              disabled={
                !booking.customerInfo.name ||
                !booking.customerInfo.email ||
                !booking.customerInfo.phone
              }
              className={`px-8 py-4 rounded-xl font-party font-bold text-lg transition-all duration-300 transform ${
                !booking.customerInfo.name ||
                !booking.customerInfo.email ||
                !booking.customerInfo.phone
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400 text-white hover:from-green-500 hover:via-emerald-500 hover:to-blue-500 hover:scale-105 shadow-lg hover:shadow-xl animate-pulse-party"
              }`}
            >
              Final Step: Payment! 💳 →
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    const pricing = calculatePrice();

    if (booking.paymentStatus === "completed") {
      return (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Your party has been booked and payment has been processed.
            You&apos;ll receive a confirmation email shortly.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Summary
            </h3>
            <div className="text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium">{booking.selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span className="font-medium">{booking.selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Package:</span>
                <span className="font-medium">
                  {booking.selectedPackage?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Room:</span>
                <span className="font-medium">
                  {booking.selectedRoom?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Children:</span>
                <span className="font-medium">{booking.kidsCount}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total Paid:</span>
                <span className="text-green-600">
                  ${pricing.deposit_amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Balance Due at Event:</span>
                <span>${pricing.balance_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Please complete your waiver before your party date:
            </p>
            <a
              href={`/${tenant}/waiver/${
                booking.paymentId || "booking-" + Date.now()
              }`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 inline-block"
            >
              Complete Waiver
            </a>

            <div className="pt-4">
              <a
                href={`/${tenant}`}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Step 4: Payment
        </h2>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Package ({booking.selectedPackage?.name}):</span>
                <span>${pricing.base_price.toFixed(2)}</span>
              </div>
              {pricing.extra_kids_price > 0 && (
                <div className="flex justify-between">
                  <span>Extra Children:</span>
                  <span>${pricing.extra_kids_price.toFixed(2)}</span>
                </div>
              )}
              {pricing.addons_price > 0 && (
                <div className="flex justify-between">
                  <span>Add-ons:</span>
                  <span>${pricing.addons_price.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8.75%):</span>
                <span>${pricing.tax.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Options
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Deposit Payment Option */}
              <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Pay Deposit (Recommended)
                </h4>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  ${pricing.deposit_amount.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Pay 50% now, remaining ${pricing.balance_amount.toFixed(2)}{" "}
                  due at the event
                </p>
                <button
                  onClick={() =>
                    processPayment(pricing.deposit_amount, "deposit")
                  }
                  disabled={booking.paymentStatus === "processing"}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  {booking.paymentStatus === "processing"
                    ? "Processing..."
                    : "Pay Deposit"}
                </button>
              </div>

              {/* Full Payment Option */}
              <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Pay in Full
                </h4>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  ${pricing.total.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Pay the full amount now and you&apos;re all set!
                </p>
                <button
                  onClick={() => processPayment(pricing.total, "full")}
                  disabled={booking.paymentStatus === "processing"}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  {booking.paymentStatus === "processing"
                    ? "Processing..."
                    : "Pay Full Amount"}
                </button>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  Secure Payment Processing
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your payment is processed securely through Clover. You&apos;ll
                  be redirected to complete your payment.
                </p>
              </div>
            </div>
          </div>

          {booking.paymentStatus === "failed" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-red-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">
                    Payment Failed
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    There was an issue processing your payment. Please try again
                    or contact support.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <button
              onClick={prevStep}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Back
            </button>
            <div className="text-sm text-gray-500 pt-3">
              Choose a payment option above to complete your booking
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 py-8 relative overflow-hidden">
      {/* Fun background decorations */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-20 animate-float"></div>
      <div
        className="absolute top-32 right-16 w-16 h-16 bg-pink-200 rounded-full opacity-20 animate-float"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-20 left-20 w-12 h-12 bg-blue-200 rounded-full opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-40 right-32 w-14 h-14 bg-green-200 rounded-full opacity-20 animate-float"
        style={{ animationDelay: "3s" }}
      ></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { number: 1, title: "🎪 Pick Package", emoji: "🎉" },
              { number: 2, title: "🏰 Choose Room", emoji: "🎈" },
              { number: 3, title: "✨ Add Fun Extras", emoji: "🎊" },
              { number: 4, title: "💳 Secure Payment", emoji: "🎁" },
            ].map((step, index) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-party font-bold transition-all duration-500 transform ${
                    step.number <= booking.step
                      ? "bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 text-white scale-110 shadow-lg animate-pulse-party"
                      : "bg-white border-4 border-gray-200 text-gray-400"
                  }`}
                >
                  {step.number <= booking.step ? "✅" : step.emoji}
                </div>
                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-party font-bold ${
                      step.number <= booking.step
                        ? "text-purple-700"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < 3 && (
                  <div
                    className={`absolute top-8 w-16 h-2 rounded-full transition-all duration-500 ${
                      step.number < booking.step
                        ? "bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400"
                        : "bg-gray-200"
                    }`}
                    style={{
                      left: `calc(${25 * (index + 1)}% + ${8 * index}px)`,
                      transform: "translateX(-50%)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <h1 className="text-4xl font-party font-bold text-purple-700 mb-2">
              🎉 Book Your Amazing Party! 🎉
            </h1>
            <p className="text-purple-600 font-playful text-lg">
              Let&apos;s create magical memories together! ✨
            </p>
          </div>
        </div>

        {/* Render Current Step */}
        {booking.step === 1 && renderStep1()}
        {booking.step === 2 && renderStep2()}
        {booking.step === 3 && renderStep3()}
        {booking.step === 4 && renderStep4()}
      </div>
    </div>
  );
}
