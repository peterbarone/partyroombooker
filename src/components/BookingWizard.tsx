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
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Step 1: Choose Package & Date
        </h2>

        <div className="space-y-8">
          {/* Package Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select a Package
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => updatePackage(pkg)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    booking.selectedPackage?.id === pkg.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {pkg.description}
                  </p>
                  <div className="mt-2">
                    <span className="text-lg font-bold text-green-600">
                      ${pkg.base_price}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      for {pkg.base_kids} kids
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ${pkg.extra_kid_price}/extra child
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          {booking.selectedPackage && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Date
              </h3>
              <input
                type="date"
                value={booking.selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setBooking({ ...booking, selectedDate: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          )}

          {/* Kids Count */}
          {booking.selectedPackage && booking.selectedDate && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Number of Children
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() =>
                    setBooking({
                      ...booking,
                      kidsCount: Math.max(1, booking.kidsCount - 1),
                    })
                  }
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-xl font-semibold">
                  {booking.kidsCount}
                </span>
                <button
                  onClick={() =>
                    setBooking({
                      ...booking,
                      kidsCount: booking.kidsCount + 1,
                    })
                  }
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center"
                >
                  +
                </button>
              </div>
              {booking.kidsCount > booking.selectedPackage.base_kids && (
                <p className="text-sm text-gray-600 mt-2">
                  Extra kids:{" "}
                  {booking.kidsCount - booking.selectedPackage.base_kids} × $
                  {booking.selectedPackage.extra_kid_price} = $
                  {(booking.kidsCount - booking.selectedPackage.base_kids) *
                    booking.selectedPackage.extra_kid_price}
                </p>
              )}
            </div>
          )}

          {/* Time Selection */}
          {booking.selectedPackage && booking.selectedDate && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Time
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
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
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      booking.selectedTime === time
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          <div></div>
          <button
            onClick={nextStep}
            disabled={
              !booking.selectedPackage ||
              !booking.selectedDate ||
              !booking.selectedTime
            }
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Next
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
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Step 2: Choose Your Room
        </h2>

        {/* Debug info */}
        <div className="mb-4">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showDebug ? "Hide" : "Show"} Debug Info
          </button>
          {showDebug && (
            <div className="mt-2 p-4 bg-gray-100 rounded text-sm">
              <p>
                Selected Package: {booking.selectedPackage?.name} (ID:{" "}
                {booking.selectedPackage?.id})
              </p>
              <p>Tenant: {tenant}</p>
              <p>Package Mappings: {JSON.stringify(packageMappings)}</p>
              <p>Eligible Room IDs: {JSON.stringify(eligibleRoomIds)}</p>
              <p>Total Rooms in System: {sampleRooms.length}</p>
              <p>Filtered Rooms: {availableRooms.length}</p>
            </div>
          )}
        </div>

        {availableRooms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No rooms available for this package. Please contact us for
              assistance.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {availableRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => updateRoom(room)}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${
                  booking.selectedRoom?.id === room.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h4 className="font-semibold text-gray-900 text-lg">
                  {room.name}
                </h4>
                <p className="text-gray-600 mt-2">{room.description}</p>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Max Capacity: {room.max_kids} children
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={!booking.selectedRoom}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const availableAddons = sampleAddons.filter(
      (addon) => addon.tenant_id === tenant && addon.active
    );

    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Step 3: Add-ons & Customer Info
        </h2>

        <div className="space-y-8">
          {/* Add-ons Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Optional Add-ons
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {availableAddons.map((addon) => {
                const currentQuantity =
                  booking.selectedAddons.find(
                    (item) => item.addon.id === addon.id
                  )?.quantity || 0;

                return (
                  <div
                    key={addon.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {addon.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {addon.description}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        ${addon.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        per {addon.unit}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateAddon(addon, Math.max(0, currentQuantity - 1))
                          }
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">
                          {currentQuantity}
                        </span>
                        <button
                          onClick={() =>
                            updateAddon(addon, currentQuantity + 1)
                          }
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-sm"
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
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Price Summary
            </h3>
            {(() => {
              const pricing = calculatePrice();
              return (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Package:</span>
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
                  <div className="flex justify-between text-green-600">
                    <span>Deposit (50%):</span>
                    <span>${pricing.deposit_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Balance Due at Event:</span>
                    <span>${pricing.balance_amount.toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={
              !booking.customerInfo.name ||
              !booking.customerInfo.email ||
              !booking.customerInfo.phone
            }
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Next
          </button>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= booking.step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < booking.step ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Book Your Party
            </h1>
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
