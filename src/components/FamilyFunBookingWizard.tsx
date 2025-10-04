"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ResponsiveBackground from "./ResponsiveBackground";
import ConfettiAnimation from "./ConfettiAnimation";

// Shared style tokens (add near top after imports and before component)
// If already present, skip duplication.
// We'll search for a marker to avoid duplication.
// Responsive style tokens (mobile-first scaling)
const inputBaseClass =
  "w-full px-5 py-4 md:px-8 md:py-5 rounded-full border-[3px] font-medium tracking-wide placeholder-opacity-70 focus:outline-none transition-all duration-200 shadow-sm focus:shadow-md bg-amber-50 border-amber-800 focus:border-pink-500 text-amber-800 placeholder-amber-600 text-base md:text-lg";

const headingStackClass =
  "space-y-1 font-extrabold tracking-tight drop-shadow-sm";
const headingLinePrimary =
  "text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-amber-800 leading-tight";
const headingLineAccent =
  "text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-pink-600 leading-tight";
const subheadingClass =
  "text-base sm:text-lg md:text-xl font-semibold tracking-wide text-amber-700";

// Types from the original BookingWizard
interface Package {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  base_kids: number;
  extra_kid_price: number;
  duration_min: number;
  includes?: string[];
}

interface Room {
  id: string;
  name: string;
  description?: string;
  max_kids: number;
  amenities?: string[];
  images?: string[];
}

interface AvailabilityRoom {
  roomId: string;
  roomName: string;
  maxKids: number;
  eligible: boolean;
  available: boolean;
}

interface AvailabilitySlot {
  timeStart: string; // ISO
  timeEnd: string;   // ISO
  rooms: AvailabilityRoom[];
}

interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  unit?: string | null;
  taxable?: boolean;
  category?: string | null;
}

interface BookingData {
  step: number;
  selectedDate: string;
  selectedPackage: Package | null;
  selectedRoom: Room | null;
  guestCount: number;
  selectedTime: string;
  selectedSlot?: { timeStart: string; timeEnd: string };
  customerInfo: {
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    childName: string;
    childAge: number;
    emergencyContact: string;
  };
  selectedAddons: Array<{ addon: Addon; quantity: number }>;
  specialNotes: string;
  paymentStatus: "pending" | "processing" | "completed" | "failed";
  paymentId?: string;
  bookingId?: string;
}

interface FamilyFunBookingWizardProps {
  tenant: string;
}

const STEPS = [
  "greeting",
  "child-name",
  "child-age",
  "party-date",
  // Option A: show availability immediately after date
  "time-slot",
  "room-choice",
  // Choose package after room
  "package-choice",
  // Then guest count and the rest
  "guest-count",
  "add-ons",
  "parent-info",
  "special-notes",
  "payment",
  "confirmation",
];

export default function FamilyFunBookingWizard({
  tenant,
}: FamilyFunBookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [packages, setPackages] = useState<Package[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[] | null>(null);
  const [availableRoomsForSelectedSlot, setAvailableRoomsForSelectedSlot] = useState<AvailabilityRoom[] | null>(null);
  const sparklesRef = useRef<
    Array<{ left: number; top: number; duration: number; delay: number }>
  >([]);

  const [bookingData, setBookingData] = useState<BookingData>({
    step: 0,
    selectedDate: "",
    selectedPackage: null,
    selectedRoom: null,
    guestCount: 1,
    selectedTime: "",
    customerInfo: {
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      childName: "",
      childAge: 0,
      emergencyContact: "",
    },
    selectedAddons: [],
    specialNotes: "",
    paymentStatus: "pending",
  });

  // Initialize sparkles
  useEffect(() => {
    sparklesRef.current = Array.from({ length: 8 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    }));
  }, []);

  // Load data from Supabase (resolve tenant slug -> id, then load catalog)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Resolve tenant id by slug
        const { data: tenantRow, error: tenantErr } = await supabase
          .from("tenants")
          .select("id")
          .eq("slug", tenant)
          .eq("active", true)
          .single();
        if (tenantErr || !tenantRow?.id) {
          console.error("Unable to resolve tenant by slug", tenantErr);
          return;
        }
        setTenantId(tenantRow.id);

        // Load packages (map to UI shape)
        const { data: packagesData } = await supabase
          .from("packages")
          .select("id,name,description,base_price,base_kids,extra_kid_price,duration_minutes,includes_json,active")
          .eq("tenant_id", tenantRow.id)
          .eq("active", true);

        // Load rooms (map to UI shape)
        const { data: roomsData } = await supabase
          .from("rooms")
          .select("id,name,description,max_kids,active")
          .eq("tenant_id", tenantRow.id)
          .eq("active", true);

        // Load addons
        const { data: addonsData } = await supabase
          .from("addons")
          .select("id,name,description,unit,price,price_cents,taxable,active")
          .eq("tenant_id", tenantRow.id)
          .eq("active", true);

        const mappedPackages: Package[] = (packagesData || []).map((p: any) => {
          const minutes = p.duration_minutes ?? 120;
          let includes: string[] | undefined = undefined;
          if (Array.isArray(p.includes_json)) {
            includes = p.includes_json;
          } else if (p.includes_json && Array.isArray(p.includes_json.includes)) {
            includes = p.includes_json.includes;
          }
          return {
            id: p.id,
            name: p.name,
            description: p.description ?? undefined,
            base_price: Number(p.base_price ?? 0),
            base_kids: Number(p.base_kids ?? 0),
            extra_kid_price: Number(p.extra_kid_price ?? 0),
            duration_min: Number(minutes),
            includes,
          };
        });

        const mappedRooms: Room[] = (roomsData || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description ?? undefined,
          max_kids: Number(r.max_kids ?? 0),
        }));

        setPackages(mappedPackages);
        setRooms(mappedRooms);
        const mappedAddons: Addon[] = (addonsData || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          description: a.description ?? "",
          price: a.price ?? (a.price_cents ? a.price_cents / 100 : 0),
          unit: a.unit ?? null,
          taxable: a.taxable ?? false,
        }));
        setAddons(mappedAddons);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenant]);

  // Fetch availability as soon as a date is chosen (Option A)
  useEffect(() => {
    if (!bookingData.selectedDate) return;

    const fetchAvailability = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("availability", {
          body: {
            tenantSlug: tenant,
            date: bookingData.selectedDate,
            // packageId and kids are optional in Option A
            packageId: bookingData.selectedPackage?.id,
            kids: bookingData.guestCount,
          },
        });
        if (error) {
          console.error("availability error", error);
          setAvailability(null);
          return;
        }
        setAvailability((data as any) || null);
      } catch (e) {
        console.error("availability exception", e);
        setAvailability(null);
      }
    };

    fetchAvailability();
  }, [tenant, bookingData.selectedDate]);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const calculateTotal = () => {
    let total = 0;
    if (bookingData.selectedPackage) {
      const p = bookingData.selectedPackage;
      const extraKids = Math.max(0, (bookingData.guestCount || 0) - (p.base_kids || 0));
      total += (p.base_price || 0) + extraKids * (p.extra_kid_price || 0);
    }
    bookingData.selectedAddons.forEach(({ addon, quantity }) => {
      total += (addon.price || 0) * quantity;
    });
    return total;
  };

  const calculateDeposit = () => {
    return Math.max(0, Math.round(calculateTotal() * 0.5 * 100) / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🎪
        </motion.div>
      </div>
    );
  }

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case "greeting":
        return renderGreetingStep();
      case "child-name":
        return renderChildNameStep();
      case "child-age":
        return renderChildAgeStep();
      case "party-date":
        return renderPartyDateStep();
      case "time-slot":
        return renderTimeSlotStep();
      case "package-choice":
        return renderPackageChoiceStep();
      case "room-choice":
        return renderRoomChoiceStep();
      case "guest-count":
        return renderGuestCountStep();
      case "add-ons":
        return renderAddOnsStep();
      case "parent-info":
        return renderParentInfoStep();
      case "special-notes":
        return renderSpecialNotesStep();
      case "payment":
        return renderPaymentStep();
      case "confirmation":
        return renderConfirmationStep();
      default:
        return <div>Step not found</div>;
    }
  };

  const renderGreetingStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="text-center space-y-6 md:space-y-8"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-6xl sm:text-7xl md:text-8xl mb-6 md:mb-8"
      >
        🎉
      </motion.div>

      <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2 md:mb-4 leading-tight">
        Welcome to the Party Palace!
      </h2>

      <p className="text-lg sm:text-xl text-gray-700 mb-6 md:mb-8">
        Let&apos;s plan the most AMAZING party ever! 🎈
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={nextStep}
        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform transition-all duration-200"
      >
        Let&apos;s Start Planning! 🚀
      </motion.button>
    </motion.div>
  );

  const renderChildNameStep = () => (
    <div className="space-y-8 text-center">
      {/* Static emoji (animation removed for mobile stability) */}
      <div className="text-8xl mb-6 select-none">🎈</div>

      <div className="space-y-1 font-extrabold tracking-tight drop-shadow-sm">
        <h2 className="text-6xl font-bold-display text-amber-800 leading-[0.95]">
          WHO&apos;S THE
        </h2>
        <h2 className="text-6xl text-amber-800 leading-[0.95]">LUCKY KID</h2>
        <h2 className="text-6xl text-pink-600 leading-[0.95]">WE&apos;RE</h2>
        <h2 className="text-6xl text-pink-600 leading-[0.95]">CELEBRATING?</h2>
      </div>

      <p className="text-xl text-amber-700 font-semibold mb-10 tracking-wide">
        Enter the birthday child&apos;s name below to get started!
      </p>

      <div className="max-w-sm mx-auto">
        <input
          type="text"
          placeholder="Enter the birthday child's name"
          value={bookingData.customerInfo.childName}
          onChange={(e) =>
            updateBookingData({
              customerInfo: {
                ...bookingData.customerInfo,
                childName: e.target.value,
              },
            })
          }
          className={`${inputBaseClass} text-amber-800 placeholder-amber-600 bg-amber-50 focus:border-pink-500`}
        />
      </div>
    </div>
  );

  const renderChildAgeStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-7xl mb-6"
        >
          🎂
        </motion.div>
        <div className={headingStackClass}>
          <h2 className={headingLinePrimary}>HOW OLD IS</h2>
          <h2 className={headingLinePrimary}>
            {bookingData.customerInfo.childName?.toUpperCase() || "THE STAR"}
          </h2>
          <h2 className={headingLineAccent}>TURNING?</h2>
        </div>
        <p className={`${subheadingClass} mb-8 mt-6 text-amber-700`}>
          Helps us plan age-perfect fun!
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <input
          type="number"
          min="1"
          max="18"
          placeholder="Age"
          value={bookingData.customerInfo.childAge || ""}
          onChange={(e) =>
            updateBookingData({
              customerInfo: {
                ...bookingData.customerInfo,
                childAge: parseInt(e.target.value) || 0,
              },
            })
          }
          className={`${inputBaseClass} text-center bg-amber-50 border-amber-800 focus:border-pink-500`}
        />
      </div>

      {/* Inline nav removed; using global nav */}
    </motion.div>
  );

  const renderPartyDateStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-6"
        >
          📅
        </motion.div>

        <div className={headingStackClass}>
          <h2 className={headingLinePrimary}>PICK THE</h2>
          <h2 className={headingLineAccent}>MAGICAL DATE</h2>
        </div>
        <p className={`${subheadingClass} mb-8 mt-6`}>Select your party day!</p>
      </div>

      <div className="max-w-md mx-auto">
        <input
          type="date"
          value={bookingData.selectedDate}
          onChange={(e) => updateBookingData({ selectedDate: e.target.value })}
          className={`${inputBaseClass}`}
        />
      </div>

      {/* Inline nav removed; using global nav */}
    </motion.div>
  );

  const renderTimeSlotStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-6"
        >
          ⏰
        </motion.div>

        <div className={headingStackClass}>
          <h2 className={headingLinePrimary}>CHOOSE YOUR</h2>
          <h2 className={headingLineAccent}>PERFECT TIME</h2>
        </div>
        <p className={`${subheadingClass} mb-8 mt-6`}>
          When will the fun begin?
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        {!availability && (
          <div className="text-brown-700">Checking availability...</div>
        )}
        {availability && availability.length === 0 && (
          <div className="text-brown-700">No time slots available. Try another date.</div>
        )}
        {availability && availability.map((slot) => {
          const label = new Date(slot.timeStart).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) +
            " - " + new Date(slot.timeEnd).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
          const isSelected = bookingData.selectedSlot?.timeStart === slot.timeStart;
          return (
            <motion.button
              key={slot.timeStart}
              onClick={() => {
                updateBookingData({ selectedTime: label, selectedSlot: { timeStart: slot.timeStart, timeEnd: slot.timeEnd } });
                setAvailableRoomsForSelectedSlot(slot.rooms || []);
              }}
              className={`w-full max-w-md p-6 rounded-3xl border-4 transition-all ${
                isSelected ? "border-party-yellow bg-white shadow-xl scale-105" : "border-transparent bg-white/80 hover:scale-105"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-xl text-brown-700 font-semibold mb-1">{label}</div>
              <div className="text-sm text-brown-600 font-playful">{(slot.rooms || []).filter(r => r.available && r.eligible).length} rooms available</div>
            </motion.button>
          );
        })}
      </div>

      {/* Inline nav removed; using global nav */}
    </motion.div>
  );

  const renderPackageChoiceStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-6"
        >
          🎁
        </motion.div>

        <div className={headingStackClass}>
          <h2 className={headingLinePrimary}>SELECT A</h2>
          <h2 className={headingLineAccent}>PARTY PACKAGE</h2>
        </div>
        <p className={`${subheadingClass} mb-8 mt-6`}>
          Pick the bundle of joy!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <motion.div
            key={pkg.id}
            className={`p-6 rounded-3xl border-4 transition-all cursor-pointer
              ${
                bookingData.selectedPackage?.id === pkg.id
                  ? "border-party-yellow bg-white shadow-xl scale-105"
                  : "border-transparent bg-white/80 hover:scale-105"
              }
            `}
            onClick={() => updateBookingData({ selectedPackage: pkg })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-5xl mb-4">
              {bookingData.selectedPackage?.id === pkg.id ? "✅" : "🎉"}
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {pkg.name}
            </div>
            <div className="text-gray-600 mb-4">{pkg.description}</div>
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold text-party-pink">
                ${pkg.base_price.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                {Math.max(1, Math.round((pkg.duration_min || 120) / 60))} hours • Includes up to {pkg.base_kids} kids
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Inline nav removed; using global nav */}
    </motion.div>
  );

  const renderRoomChoiceStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-6"
        >
          🏰
        </motion.div>

        <div className={headingStackClass}>
          <h2 className={headingLinePrimary}>CHOOSE YOUR</h2>
          <h2 className={headingLineAccent}>EPIC ROOM</h2>
        </div>
        <p className={`${subheadingClass} mb-8 mt-6`}>Fit the vibe & size.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {(availableRoomsForSelectedSlot
          ? availableRoomsForSelectedSlot
              .filter(r => r.available && r.eligible)
              .map(r => ({ id: r.roomId, name: r.roomName, max_kids: r.maxKids }))
          : rooms
        ).map((room) => (
          <motion.div
            key={room.id}
            className={`p-6 rounded-3xl border-4 transition-all cursor-pointer
              ${
                bookingData.selectedRoom?.id === room.id
                  ? "border-party-yellow bg-white shadow-xl scale-105"
                  : "border-transparent bg-white/80 hover:scale-105"
              }
            `}
            onClick={() => updateBookingData({ selectedRoom: room as any })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-5xl mb-4">
              {bookingData.selectedRoom?.id === room.id ? "✅" : "🏰"}
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {room.name}
            </div>
            {((room as any).description ? (
              <div className="text-gray-600 mb-4">{(room as any).description}</div>
            ) : null)}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Fits up to {room.max_kids} kids
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Inline nav removed; using global nav */}
    </motion.div>
  );

  const renderGuestCountStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-6"
        >
          👥
        </motion.div>

        <div className={headingStackClass}>
          <h2 className={headingLinePrimary}>GUEST</h2>
          <h2 className={headingLineAccent}>COUNT</h2>
        </div>
        <p className={`${subheadingClass} mb-8 mt-6`}>How many party pals?</p>
      </div>

      <div className="flex justify-center items-center gap-6">
        <button
          onClick={() =>
            updateBookingData({
              guestCount: Math.max(1, bookingData.guestCount - 1),
            })
          }
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white text-3xl font-bold hover:scale-110 transition-transform shadow-lg"
        >
          -
        </button>
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-2xl"
          key={bookingData.guestCount}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.6 }}
        >
          <span className="text-5xl font-bold-display">
            {bookingData.guestCount}
          </span>
        </motion.div>
        <button
          onClick={() =>
            updateBookingData({ guestCount: bookingData.guestCount + 1 })
          }
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white text-3xl font-bold hover:scale-110 transition-transform shadow-lg"
        >
          +
        </button>
      </div>

      {/* Inline nav removed; using global nav */}
    </motion.div>
  );

  const renderAddOnsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-6"
        >
          🎈
        </motion.div>

        <div className={headingStackClass}>
          <h2 className={headingLinePrimary}>FUN</h2>
          <h2 className={headingLineAccent}>ADD-ONS</h2>
        </div>
        <p className={`${subheadingClass} mb-8 mt-6`}>Boost the celebration!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {addons.map((addon) => (
          <motion.div
            key={addon.id}
            className={`p-6 rounded-3xl border-4 transition-all cursor-pointer
              ${
                bookingData.selectedAddons.some((a) => a.addon.id === addon.id)
                  ? "border-party-yellow bg-white shadow-xl scale-105"
                  : "border-transparent bg-white/80 hover:scale-105"
              }
            `}
            onClick={() => {
              const exists = bookingData.selectedAddons.find(
                (a) => a.addon.id === addon.id
              );
              if (exists) {
                updateBookingData({
                  selectedAddons: bookingData.selectedAddons.filter(
                    (a) => a.addon.id !== addon.id
                  ),
                });
              } else {
                updateBookingData({
                  selectedAddons: [
                    ...bookingData.selectedAddons,
                    { addon, quantity: 1 },
                  ],
                });
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-5xl mb-4">
              {bookingData.selectedAddons.some((a) => a.addon.id === addon.id)
                ? "✅"
                : "➕"}
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {addon.name}
            </div>
            <div className="text-gray-600 mb-4">{addon.description}</div>
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold text-party-pink">
                ${addon.price.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">{addon.category}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Inline nav removed; using global nav */}
    </motion.div>
  );

  const renderParentInfoStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-6"
        >
          📝
        </motion.div>

        <div className={headingStackClass}>
          <h2 className={headingLinePrimary}>YOUR</h2>
          <h2 className={headingLineAccent}>CONTACT INFO</h2>
        </div>
        <p className={`${subheadingClass} mb-8 mt-6`}>Stay in the loop!</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Parent's Name"
          value={bookingData.customerInfo.parentName}
          onChange={(e) =>
            updateBookingData({
              customerInfo: {
                ...bookingData.customerInfo,
                parentName: e.target.value,
              },
            })
          }
          className={inputBaseClass}
        />

        <input
          type="email"
          placeholder="Parent's Email"
          value={bookingData.customerInfo.parentEmail}
          onChange={(e) =>
            updateBookingData({
              customerInfo: {
                ...bookingData.customerInfo,
                parentEmail: e.target.value,
              },
            })
          }
          className={inputBaseClass}
        />

        <input
          type="tel"
          placeholder="Parent's Phone"
          value={bookingData.customerInfo.parentPhone}
          onChange={(e) =>
            updateBookingData({
              customerInfo: {
                ...bookingData.customerInfo,
                parentPhone: e.target.value,
              },
            })
          }
          className={inputBaseClass}
        />
      </div>

      {/* Inline nav removed; using global nav */}
    </motion.div>
  );

  const renderSpecialNotesStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-6"
        >
          💭
        </motion.div>

        <div className={headingStackClass}>
          <h2 className={headingLinePrimary}>SPECIAL</h2>
          <h2 className={headingLineAccent}>REQUESTS</h2>
        </div>
        <p className={`${subheadingClass} mb-8 mt-6`}>
          Anything we should know?
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <textarea
          placeholder="Allergies, themes, decorations, etc."
          value={bookingData.specialNotes}
          onChange={(e) => updateBookingData({ specialNotes: e.target.value })}
          className={`${inputBaseClass} rounded-3xl h-40 resize-none`}
        />
      </div>

      {/* Inline nav removed; using global nav */}
    </motion.div>
  );

  const renderPaymentStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-6"
        >
          💰
        </motion.div>

        <div className={headingStackClass}>
          <h2 className={headingLinePrimary}>SECURE</h2>
          <h2 className={headingLineAccent}>YOUR PARTY</h2>
        </div>
        <p className={`${subheadingClass} mb-8 mt-6`}>
          Lock it in with a deposit.
        </p>
      </div>

      <div className="bg-white/90 rounded-3xl p-8 max-w-md mx-auto mb-8">
        <h3 className="font-party text-2xl text-brown-700 mb-6">
          Party Summary 🎉
        </h3>

        <div className="text-left space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="font-playful">Birthday Star:</span>
            <span className="font-bold">
              {bookingData.customerInfo.childName} (turning{" "}
              {bookingData.customerInfo.childAge}!)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-playful">Date & Time:</span>
            <span className="font-bold">
              {bookingData.selectedDate} • {bookingData.selectedTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-playful">Package:</span>
            <span className="font-bold">
              {bookingData.selectedPackage?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-playful">Room:</span>
            <span className="font-bold">{bookingData.selectedRoom?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-playful">Guest Count:</span>
            <span className="font-bold">{bookingData.guestCount} kids</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between text-xl font-party text-brown-700">
            <span>Deposit Required:</span>
            <span className="text-party-pink">${calculateDeposit().toFixed(2)}</span>
          </div>
          <p className="text-sm text-brown-600 font-playful mt-2">
            Remaining balance due on party day
          </p>
        </div>
      </div>

      <motion.button
        onClick={async () => {
          try {
            updateBookingData({ paymentStatus: "processing" });
            const { data, error } = await supabase.functions.invoke("createBooking", {
              body: {
                tenantSlug: tenant,
                customer: {
                  name: bookingData.customerInfo.parentName,
                  email: bookingData.customerInfo.parentEmail,
                  phone: bookingData.customerInfo.parentPhone,
                },
                packageId: bookingData.selectedPackage?.id,
                roomId: bookingData.selectedRoom?.id,
                startTime: bookingData.selectedSlot?.timeStart,
                kidsCount: bookingData.guestCount,
              },
            });
            if (error) {
              console.error("createBooking error", error);
              updateBookingData({ paymentStatus: "failed" });
              return;
            }
            const checkoutUrl = (data as any)?.checkoutUrl;
            const bookingId = (data as any)?.bookingId;
            updateBookingData({ bookingId, paymentId: (data as any)?.paymentId });
            if (checkoutUrl) {
              window.location.href = checkoutUrl;
            } else {
              // Fallback advance if no URL (dev mode)
              setShowCelebration(true);
              setTimeout(() => nextStep(), 500);
            }
          } catch (e) {
            console.error("createBooking exception", e);
            updateBookingData({ paymentStatus: "failed" });
          }
        }}
        className="btn-party text-xl px-12 py-4"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🚀 Secure My Party Spot! 🚀
      </motion.button>
    </motion.div>
  );

  const renderConfirmationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="space-y-8"
    >
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl mb-8"
        >
          🎉
        </motion.div>

        <div className={headingStackClass}>
          <h2 className={headingLineAccent}>WOOHOO!</h2>
          <h2 className={headingLinePrimary}>YOU&apos;RE BOOKED 🎊</h2>
        </div>
        <p className={`${subheadingClass} mb-8 mt-6 text-amber-700`}>
          Party locked in! Watch your inbox for details. Can&apos;t wait to
          celebrate {bookingData.customerInfo.childName || "together"}!
        </p>
      </div>

      <div className="bg-white/90 rounded-3xl p-6 max-w-md mx-auto mb-8">
        <h3 className="font-party text-xl text-brown-700 mb-4">
          🎂 Party Details
        </h3>
        <div className="text-left space-y-2 font-playful text-brown-600">
          <div>📅 {bookingData.selectedDate}</div>
          <div>⏰ {bookingData.selectedTime}</div>
          <div>🏠 {bookingData.selectedRoom?.name}</div>
          <div>👥 {bookingData.guestCount} guests</div>
        </div>
      </div>

      {bookingData.bookingId && (
        <div className="text-center">
          <a
            href={`/${tenant}/waiver/${bookingData.bookingId}`}
            className="inline-block mt-2 text-party-pink font-bold underline"
          >
            Complete Waiver
          </a>
        </div>
      )}

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <button className="btn-celebration">📧 View Email Confirmation</button>
        <div>
          <button
            onClick={() => {
              setCurrentStep(0);
              setBookingData({
                step: 0,
                selectedDate: "",
                selectedPackage: null,
                selectedRoom: null,
                guestCount: 1,
                selectedTime: "",
                customerInfo: {
                  parentName: "",
                  parentEmail: "",
                  parentPhone: "",
                  childName: "",
                  childAge: 0,
                  emergencyContact: "",
                },
                selectedAddons: [],
                specialNotes: "",
                paymentStatus: "pending",
              });
            }}
            className="btn-fun"
          >
            🎪 Book Another Party
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Validation gating for Next button (mobile + desktop unified)
  function isNextDisabled() {
    switch (STEPS[currentStep]) {
      case "child-name":
        return !bookingData.customerInfo.childName.trim();
      case "child-age":
        return (
          !bookingData.customerInfo.childAge ||
          bookingData.customerInfo.childAge < 1
        );
      case "party-date":
        return !bookingData.selectedDate;
      case "time-slot":
        return !bookingData.selectedTime;
      case "package-choice":
        return !bookingData.selectedPackage;
      case "room-choice":
        return !bookingData.selectedRoom;
      case "parent-info":
        return (
          !bookingData.customerInfo.parentName.trim() ||
          !bookingData.customerInfo.parentEmail.trim() ||
          !bookingData.customerInfo.parentPhone.trim()
        );
      default:
        return false;
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row relative">
      {/* Mobile full background */}
      <div className="absolute inset-0 lg:hidden bg-[url('/newmobilebackgroundimage.png')] bg-top bg-cover bg-no-repeat" />
      <div className="absolute inset-0 lg:hidden" />

      {/* Desktop visual panel */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/party-background.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
      </div>

      {/* Content panel */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-transparent lg:bg-gradient-to-b lg:from-white/10 lg:to-white/10 lg:backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
        {showCelebration && <ConfettiAnimation />}

        {/* Sticky progress */}
        <div className="sticky top-0 z-20 px-4 pt-4 pb-3 bg-white/80 backdrop-blur-md shadow-sm border-b border-amber-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Step {currentStep + 1} / {STEPS.length}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-amber-700 tracking-wide">
              {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-amber-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStep + 1) / STEPS.length) * 100}%`,
              }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-8 space-y-6">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>
        {/* Global nav bar (flow-based) */}
        {STEPS[currentStep] !== "greeting" &&
          STEPS[currentStep] !== "payment" &&
          STEPS[currentStep] !== "confirmation" && (
            <div className="px-4 pt-2 pb-4 bg-white/10 backdrop-blur-md border-t border-amber-200 flex items-center justify-between gap-3">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold border-[3px] border-amber-800 text-amber-800 bg-amber-50 hover:bg-amber-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={isNextDisabled()}
                className="flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 border-[3px] border-pink-600 shadow-sm hover:shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}

        {/* Removed bottom decorative image; handled by root mobile background */}
      </div>
    </div>
  );
}
