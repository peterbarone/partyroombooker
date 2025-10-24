"use client";

import { useState, useEffect, useRef, ReactNode, Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import ResponsiveStage from "@/components/layout/ResponsiveStage";
import HUD from "@/components/hud/HUD";
// Modular Steps (HUD content)
import GreetingStep from "@/app/steps/Greeting";
import ChildNameStep from "@/app/steps/ChildInfo";
import ChildAgeStep from "@/app/steps/ChildAge";
import PartyDateStep from "@/app/steps/PartyDate";
// import TimeSlotStep from "@/app/steps/TimeSlot";
import RoomChoiceStep from "@/app/steps/RoomChoice";
// import PackageChoiceStep from "@/app/steps/PackageChoice";
import GuestCountStep from "@/app/steps/GuestCount";
import ParentInfoStep from "@/app/steps/ParentInfo";
import SpecialNotesStep from "@/app/steps/SpecialNotes";
import PaymentStep from "@/app/steps/Payment";
import ConfirmationStep from "@/app/steps/Confirmation";
import Calendar from "@/components/ui/Calendar";

// Modular Scenes (visuals/midground)
import GreetingScene from "@/components/scenes/GreetingScene";
import ChildNameScene from "@/components/scenes/ChildInfoScene";
import ChildAgeScene from "@/components/scenes/ChildAgeScene";
import PartyDateScene from "@/components/scenes/PartyDateScene";
import TimeSlotScene from "@/components/scenes/TimeSlotScene";
import RoomChoiceScene from "@/components/scenes/RoomChoiceScene";
import PackageChoiceScene from "@/components/scenes/PackageChoiceScene";
import GuestCountScene from "@/components/scenes/GuestCountScene";
import ParentInfoScene from "@/components/scenes/ParentInfoScene";
import SpecialNotesScene from "@/components/scenes/SpecialNotesScene";
import PaymentScene from "@/components/scenes/PaymentScene";
import ConfirmationScene from "@/components/scenes/ConfirmationScene";

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  Responsive, Layered Layout: Stage + Scene + HUD
 *  - Art-directed backgrounds (mobile/tablet/desktop)
 *  - Characters/midground are separate from HUD/controls
 *  - Sticky progress + hold banner lives in HUD
 * ──────────────────────────────────────────────────────────────────────────────
 */

/** Using shared ResponsiveStage from components/layout/ResponsiveStage */

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  Shared style tokens
 * ──────────────────────────────────────────────────────────────────────────────
 */
const inputBaseClass =
  "form-input-bg w-full px-5 py-4 md:px-8 md:py-5 rounded-full border-[3px] font-medium tracking-wide placeholder-opacity-70 focus:outline-none transition-all duration-200 shadow-sm focus:shadow-md bg-amber-50 border-amber-800 focus:border-pink-500 text-amber-800 placeholder-amber-600 text-base md:text-lg";

const headingStackClass = "space-y-1 font-extrabold tracking-tight drop-shadow-sm";
const headingLinePrimary = "text-amber-800 leading-tight";
const headingLineAccent = "text-pink-600 leading-tight";
const subheadingClass = "text-base sm:text-lg md:text-xl font-semibold tracking-wide text-amber-700";

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  Types
 * ──────────────────────────────────────────────────────────────────────────────
 */
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
  timeEnd: string; // ISO
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
interface PartyCharacter {
  id: string;
  slug?: string;
  name: string;
  price: number; // dollars
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
  selectedCharacters: Array<{ character: PartyCharacter; quantity: number }>;
  specialNotes: string;
  paymentStatus: "pending" | "processing" | "completed" | "failed";
  paymentId?: string;
  bookingId?: string;
}
interface FamilyFunBookingWizardProps {
  tenant: string;
}

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  Steps & Component
 * ──────────────────────────────────────────────────────────────────────────────
 */

const STEPS = [
  "greeting",
  "child-name",
  "child-age",
  "party-date",
  "time-slot",
  "room-choice",
  "package-choice",
  "guest-count",
  "parent-info",
  "special-notes",
  "payment",
  "confirmation",
] as const;
type StepKey = typeof STEPS[number];

const formatTenantName = (slug: string) => {
  if (!slug) return "";
  const parts = slug.replace(/_/g, "-").split("-");
  const titled = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  return titled.join(" ");
};

// Background resolver per step (tenant-aware if needed)
const getBackgroundsForStep = (step: StepKey, tenant?: string) => {
  switch (step) {
    case "child-name":
      // Backgrounds for the "WHO'S THE BIRTHDAY STAR?" step
      return {
        mobile: "/assets/child-name/bg-mobile.png",
        tablet: "/assets/child-name/bg-tablet.png",
        desktop: "/assets/child-name/bg-desktop.png",
      };
    case "child-age":
      // Backgrounds for the "HOW OLD IS ... TURNING?" step
      return {
        mobile: "/assets/child-age/bg-mobile.png",
        tablet: "/assets/child-age/bg-tablet.png",
        desktop: "/assets/child-age/bg-desktop.png",
      };
    case "party-date":
      // Backgrounds for the party date selection step
      return {
        mobile: "/assets/date/bg-mobile.png",
        tablet: "/assets/date/bg-tablet.png",
        desktop: "/assets/date/bg-desktop.png",
      };
    case "time-slot":
      // Backgrounds for the time slot selection step
      return {
        mobile: "/assets/time/bg-mobile.png",
        tablet: "/assets/time/bg-tablet.png",
        desktop: "/assets/time/bg-desktop.png",
      };
    case "room-choice":
      // Backgrounds for the room choice step
      return {
        mobile: "/assets/room/bg-mobile.png",
        tablet: "/assets/room/bg-tablet.png",
        desktop: "/assets/room/bg-desktop.png",
      };
    case "guest-count":
      // Backgrounds for the guest count step
      return {
        mobile: "/assets/guestcount/bg-mobile.png",
        tablet: "/assets/guestcount/bg-tablet.png",
        desktop: "/assets/guestcount/bg-desktop.png",
      };
    case "greeting":
    default: {
      const base = "/assets/greeting";
      return {
        mobile: `${base}/bg-mobile.png`,
        tablet: `${base}/bg-tablet.png`,
        desktop: `${base}/greeting-desktop.png`,
      };
    }
  }
};

// Map step to Scene component
const SceneByStep: Record<StepKey, React.ComponentType | null> = {
  "greeting": GreetingScene,
  "child-name": ChildNameScene,
  "child-age": ChildAgeScene,
  "party-date": PartyDateScene,
  "time-slot": TimeSlotScene,
  "room-choice": RoomChoiceScene,
  "package-choice": PackageChoiceScene,
  "guest-count": GuestCountScene,
  "parent-info": ParentInfoScene,
  "special-notes": SpecialNotesScene,
  "payment": PaymentScene,
  "confirmation": ConfirmationScene,
};

export default function FamilyFunBookingWizardV2({ tenant }: FamilyFunBookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [packages, setPackages] = useState<Package[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [characters, setCharacters] = useState<PartyCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[] | null>(null);
  const [availableRoomsForSelectedSlot, setAvailableRoomsForSelectedSlot] = useState<AvailabilityRoom[] | null>(null);
  const [availabilitySource, setAvailabilitySource] = useState<'edge' | 'fallback' | 'none'>('none');

  // Hold state
  const [hold, setHold] = useState<{ id: string; expiresAt: string } | null>(null);
  const [holdRemaining, setHoldRemaining] = useState<number | null>(null);

  // Sparkles (kept in case you want scene confetti later)
  const sparklesRef = useRef<Array<{ left: number; top: number; duration: number; delay: number }>>([]);

  // Booking state
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
    selectedCharacters: [],
    specialNotes: "",
    paymentStatus: "pending",
  });

  // Helpers
  const fmtMMSS = (secs: number) => {
    const m = Math.max(0, Math.floor(secs / 60));
    const s = Math.max(0, secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const nextStep = () => setCurrentStep((i) => Math.min(i + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((i) => Math.max(i - 1, 0));
  const stepKey: StepKey = STEPS[currentStep];

  const updateBookingData = (data: Partial<BookingData>) =>
    setBookingData((prev) => ({ ...prev, ...data }));

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
    (bookingData.selectedCharacters || []).forEach(({ character, quantity }) => {
      total += (character.price || 0) * quantity;
    });
    return total;
  };
  const calculateDeposit = () => Math.max(0, Math.round(calculateTotal() * 0.5 * 100) / 100);

  // Init sparkles once
  useEffect(() => {
    sparklesRef.current = Array.from({ length: 8 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    }));
  }, []);

  // Data load
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
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

        const { data: packagesData } = await supabase
          .from("packages")
          .select(
            "id,name,description,base_price,base_kids,extra_kid_price,duration_minutes,includes_json,active"
          )
          .eq("tenant_id", tenantRow.id)
          .eq("active", true);

        const { data: roomsData } = await supabase
          .from("rooms")
          .select("id,name,description,max_kids,active")
          .eq("tenant_id", tenantRow.id)
          .eq("active", true);

        const { data: addonsData } = await supabase
          .from("addons")
          .select("id,name,description,unit,price,price_cents,taxable,active")
          .eq("tenant_id", tenantRow.id)
          .eq("active", true);

        const mappedPackages: Package[] = (packagesData || []).map((p: any) => {
          const minutes = p.duration_minutes ?? 120;
          let includes: string[] | undefined = undefined;
          if (Array.isArray(p.includes_json)) includes = p.includes_json;
          else if (p.includes_json && Array.isArray(p.includes_json.includes)) includes = p.includes_json.includes;
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

        const mappedAddons: Addon[] = (addonsData || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          description: a.description ?? "",
          price: a.price ?? (a.price_cents ? a.price_cents / 100 : 0),
          unit: a.unit ?? null,
          taxable: a.taxable ?? false,
        }));

        setPackages(mappedPackages);
        setRooms(mappedRooms);
        setAddons(mappedAddons);

        const { data: charsData } = await supabase
          .from("party_characters")
          .select("id,slug,name,price_cents,is_active")
          .eq("tenant_id", tenantRow.id)
          .eq("is_active", true)
          .order("name");

        const mappedChars: PartyCharacter[] = (charsData || []).map((c: any) => ({
          id: c.id,
          slug: c.slug || undefined,
          name: c.name || "",
          price: c.price_cents ? c.price_cents / 100 : 0,
        }));
        setCharacters(mappedChars);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tenant]);

  // Availability fetch after date selection (with fallback to slot_templates)
  useEffect(() => {
    if (!bookingData.selectedDate) return;
    const fetchAvailability = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("availability", {
          body: {
            tenantSlug: tenant,
            date: bookingData.selectedDate,
            packageId: bookingData.selectedPackage?.id,
            kids: bookingData.guestCount,
          },
        });
        if (!error && Array.isArray(data) && data.length > 0) {
          setAvailability(data as any);
          setAvailabilitySource('edge');
          return;
        }
        // Fallback: derive from slot_templates when function is unavailable or empty
        if (!tenantId) {
          setAvailability([]);
          setAvailabilitySource('none');
          return;
        }
        const jsDate = new Date(bookingData.selectedDate + "T00:00:00");
        const dow = jsDate.getUTCDay(); // 0=Sun (UTC)
        const { data: slotsTpl, error: tplErr } = await supabase
          .from("slot_templates")
          .select("start_times_json, open_time, close_time")
          .eq("tenant_id", tenantId)
          .eq("day_of_week", dow)
          .eq("active", true)
          .limit(1)
          .maybeSingle();
        if (tplErr || !slotsTpl) {
          setAvailability([]);
          setAvailabilitySource('none');
          return;
        }
        let starts: string[] = [];
        try {
          starts = Array.isArray(slotsTpl.start_times_json)
            ? slotsTpl.start_times_json
            : JSON.parse(slotsTpl.start_times_json || "[]");
        } catch {
          starts = [];
        }
        // Assume 2h duration windows by default
        const mkIso = (dateIso: string, hm: string) => `${dateIso}T${hm}:00`;
        const addHours = (iso: string, h: number) => {
          const d = new Date(iso);
          d.setHours(d.getHours() + h);
          return d.toISOString();
        };
        const roomList = (rooms || []).map((r) => ({
          roomId: r.id,
          roomName: r.name,
          maxKids: r.max_kids,
          eligible: true,
          available: true,
        }));
        const derived = starts.map((hm) => {
          const startIsoLocal = mkIso(bookingData.selectedDate, hm);
          return {
            timeStart: new Date(startIsoLocal).toISOString(),
            timeEnd: addHours(startIsoLocal, 2),
            rooms: roomList,
          } as AvailabilitySlot;
        });
        setAvailability(derived);
        setAvailabilitySource('fallback');
      } catch (e) {
        console.error("availability exception", e);
        setAvailability([]);
        setAvailabilitySource('none');
      }
    };
    fetchAvailability();
  }, [tenant, tenantId, rooms, bookingData.selectedDate, bookingData.selectedPackage?.id, bookingData.guestCount]);

  // Heartbeat: extend hold on payment step
  useEffect(() => {
    if (STEPS[currentStep] !== "payment" || !hold?.id) return;
    const interval = setInterval(() => {
      supabase.functions.invoke("extendHold", { body: { holdId: hold.id, extendMinutes: 5 } }).catch(() => {});
    }, 180000);
    return () => clearInterval(interval);
  }, [currentStep, hold?.id]);

  // Hold countdown
  useEffect(() => {
    if (!hold?.expiresAt) {
      setHoldRemaining(null);
      return;
    }
    const tick = () => {
      const diffMs = new Date(hold.expiresAt).getTime() - Date.now();
      const secs = Math.max(0, Math.floor(diffMs / 1000));
      setHoldRemaining(secs);
      if (secs <= 0) setHold(null);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [hold?.expiresAt]);

  // Cleanup: release hold on unmount
  useEffect(() => {
    return () => {
      if (hold?.id) supabase.functions.invoke("releaseHold", { body: { holdId: hold.id } }).catch(() => {});
    };
  }, [hold?.id]);

  // ────────────────────────────────────────────────────────────────────────────
  // Step Renderers (unchanged content, restyled to live INSIDE the Stage HUD)
  // ────────────────────────────────────────────────────────────────────────────

  const Greeting = () => (
    <div className="h-full w-full flex flex-col items-center justify-center text-center">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-6xl sm:text-7xl md:text-8xl mb-6 md:mb-8"
      >
        🎉
      </motion.div>
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2 md:mb-4 leading-tight drop-shadow">
        Welcome to {formatTenantName(tenant)}!
      </h2>
      <p className="text-lg sm:text-xl text-gray-800 mb-6 md:mb-10">
        Let&apos;s plan the most AMAZING party ever! 🎈
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={nextStep}
        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-full text-lg md:text-xl font-bold shadow-lg hover:shadow-xl transition"
      >
        Let&apos;s Start Planning! 🚀
      </motion.button>
    </div>
  );

  const ChildName = () => (
    <div className="h-full w-full flex flex-col items-center justify-center @container">
      {/* Title is rendered by HUD */}
      <div className="w-full max-w-md">
        <input
          type="text"
          placeholder="Enter your child’s name"
          value={bookingData.customerInfo.childName}
          onChange={(e) =>
            updateBookingData({
              customerInfo: { ...bookingData.customerInfo, childName: e.target.value },
            })
          }
          className={`${inputBaseClass} text-center`}
        />
      </div>
    </div>
  );

  const ChildAge = () => (
    <div className="h-full w-full flex flex-col items-center justify-center">
      {/* Title is rendered by HUD */}
      <div className="text-center mb-4">
        <p className={`${subheadingClass}`}>Helps us plan age-perfect fun!</p>
      </div>
      <div className="w-full max-w-xs">
        <input
          type="number"
          min={1}
          max={18}
          placeholder="Age"
          value={bookingData.customerInfo.childAge || ""}
          onChange={(e) =>
            updateBookingData({
              customerInfo: { ...bookingData.customerInfo, childAge: parseInt(e.target.value) || 0 },
            })
          }
          className={`${inputBaseClass} text-center`}
        />
      </div>
    </div>
  );

  const PartyDate = () => (
    <div className="h-full w-full flex flex-col items-center justify-center">
      {/* Title is rendered by HUD */}
      <div className="w-full max-w-md px-2">
        <Calendar
          value={bookingData.selectedDate || null}
          onChange={(iso) => {
            updateBookingData({ selectedDate: iso, selectedSlot: undefined, selectedTime: "" });
          }}
          minDate={new Date()}
          className="w-full"
        />
      </div>
    </div>
  );

  const TimeSlot = () => (
    <div className="h-full w-full flex flex-col items-center justify-center">
      {/* Title is rendered by HUD */}
      {!bookingData.selectedDate && (
        <div className="mb-4 text-center text-amber-900 font-semibold">Pick a date first</div>
      )}
      {!!bookingData.selectedDate && (
        <div className="mb-4 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
            {new Date(bookingData.selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      )}
      {!!bookingData.selectedDate && (
        <div className="mb-2 text-xs text-amber-700">Source: {availabilitySource}</div>
      )}
      <div className="w-full max-w-md flex flex-col gap-3">
        {!availability && <div className="text-amber-800 text-center">Checking availability…</div>}
        {availability && availability.length === 0 && (
          <div className="text-amber-800 text-center">No time slots available. Try another date.</div>
        )}
        {availability &&
          availability.map((slot) => {
            const label =
              new Date(slot.timeStart).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) +
              " – " +
              new Date(slot.timeEnd).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
            const isSelected = bookingData.selectedSlot?.timeStart === slot.timeStart;
            return (
              <motion.button
                key={slot.timeStart}
                onClick={() => {
                  updateBookingData({
                    selectedTime: label,
                    selectedSlot: { timeStart: slot.timeStart, timeEnd: slot.timeEnd },
                  });
                  setAvailableRoomsForSelectedSlot(slot.rooms || []);
                }}
                className={`relative w-full p-5 rounded-3xl border-4 transition-all ${
                  isSelected
                    ? "border-amber-400 bg-white shadow-xl scale-[1.02]"
                    : "border-transparent bg-white/80 hover:scale-[1.01]"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-lg text-amber-900 font-semibold mb-1">{label}</div>
                <div className="text-sm text-amber-700">
                  {(slot.rooms || []).filter((r) => r.available && r.eligible).length} rooms available
                </div>
              </motion.button>
            );
          })}
      </div>
    </div>
  );

  const RoomChoice = () => {
    const list = availableRoomsForSelectedSlot
      ? availableRoomsForSelectedSlot.map((r) => ({
          id: r.roomId,
          name: r.roomName,
          max_kids: r.maxKids,
          available: r.available,
          eligible: r.eligible,
        }))
      : (rooms || []).map((r) => ({
          id: r.id,
          name: r.name,
          max_kids: r.max_kids,
          available: true,
          eligible: true,
        }));

    const totalRooms = rooms?.length || 0;
    const slotRooms = availableRoomsForSelectedSlot?.length || 0;
    const listCount = list.length;

    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        {/* Title is rendered by HUD */}
        {(bookingData.selectedDate || bookingData.selectedTime) && (
          <div className="mb-4 text-center flex items-center justify-center gap-2 flex-wrap">
            {bookingData.selectedDate && (
              <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
                {new Date(bookingData.selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {bookingData.selectedTime && (
              <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
                {bookingData.selectedTime}
              </span>
            )}
          </div>
        )}
        <div className="mb-2 text-xs text-amber-700">
          Rooms loaded: {totalRooms} • Rooms for selected slot: {slotRooms}
        </div>
        {listCount === 0 && (
          <div className="text-amber-800 text-center mb-4">No rooms available for this time. Try another time or date.</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl">
          {list.map((room) => {
            const isDisabled = !room.available || !room.eligible;
            const selected = bookingData.selectedRoom?.id === room.id;
            return (
            <motion.div
              key={room.id}
              className={`relative p-6 rounded-3xl border-4 transition-all ${
                selected
                  ? "border-amber-400 bg-white shadow-xl scale-[1.02]"
                  : isDisabled
                  ? "border-dashed border-amber-300 bg-white/60 cursor-not-allowed"
                  : "border-transparent bg-white/80 hover:scale-[1.01] cursor-pointer"
              }`}
              onClick={async () => {
                updateBookingData({ selectedRoom: room as any });
                const slot = bookingData.selectedSlot;
                if (!tenant || !slot?.timeStart || !slot?.timeEnd) return;
                if (hold?.id) {
                  try {
                    await supabase.functions.invoke("releaseHold", { body: { holdId: hold.id } });
                  } catch {}
                  setHold(null);
                }
                try {
                  const { data, error } = await supabase.functions.invoke("createHold", {
                    body: {
                      tenantSlug: tenant,
                      roomId: room.id,
                      startTime: slot.timeStart,
                      endTime: slot.timeEnd,
                      packageId: bookingData.selectedPackage?.id,
                      kids: bookingData.guestCount,
                    },
                  });
                  if (!error) {
                    const holdId = (data as any)?.holdId as string | undefined;
                    const expiresAt = (data as any)?.expiresAt as string | undefined;
                    if (holdId && expiresAt) setHold({ id: holdId, expiresAt });
                  } else {
                    console.error("createHold error", error);
                  }
                } catch (e) {
                  console.error("createHold exception", e);
                }
              }}
              whileHover={{ scale: isDisabled ? 1 : 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-4xl">{selected ? "✅" : "🏰"}</div>
                {!room.eligible && (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">Not eligible</span>
                )}
                {room.eligible && !room.available && (
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">Not available</span>
                )}
              </div>
              <div className="text-xl font-bold text-amber-900 mb-1">{room.name}</div>
              <div className="text-sm text-amber-700">Fits up to {room.max_kids} kids</div>
            </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const PackageChoice = () => (
    <div className="h-full w-full flex flex-col items-center justify-start pt-20">
      {/* Title is rendered by HUD */}
      {(bookingData.selectedDate || bookingData.selectedTime || bookingData.selectedRoom) && (
        <div className="mb-4 text-center flex items-center justify-center gap-2 flex-wrap">
          {bookingData.selectedDate && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {new Date(bookingData.selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {bookingData.selectedTime && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {bookingData.selectedTime}
            </span>
          )}
          {bookingData.selectedRoom && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {bookingData.selectedRoom.name}
            </span>
          )}
        </div>
      )}
      <div className="mb-2 text-xs text-amber-700">Packages loaded: {packages.length}</div>
      <div className="text-center text-amber-900 font-bold mb-2">Packages</div>
      {packages.length === 0 && (
        <div className="text-amber-800 text-center mb-4">No packages available. Make sure your tenant has active packages in Supabase.</div>
      )}
      <div className="mt-4 grid grid-cols-1 gap-4 w-full max-w-md">
        {packages.map((pkg) => (
          <motion.div
            key={pkg.id}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              bookingData.selectedPackage?.id === pkg.id
                ? "border-amber-400 bg-white shadow-md scale-[1.01]"
                : "border-transparent bg-white/80 hover:scale-[1.005]"
            }`}
            onClick={() => updateBookingData({ selectedPackage: pkg })}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-2xl mb-2">{bookingData.selectedPackage?.id === pkg.id ? "✅" : "🎉"}</div>
            <div className="text-base font-bold text-amber-900">{pkg.name}</div>
            {!!pkg.description && <div className="text-xs text-amber-700 mt-1 line-clamp-2">{pkg.description}</div>}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-pink-600">${pkg.base_price.toFixed(2)}</div>
              <div className="text-[11px] text-amber-700">
                {Math.max(1, Math.round((pkg.duration_min || 120) / 60))} hrs • up to {pkg.base_kids} kids
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {characters.length > 0 && (
        <div className="w-full max-w-md mt-10">
          <div className="text-center mb-2">
            <div className={headingStackClass}>
              <h3 className={`${headingLinePrimary} text-2xl sm:text-3xl`}>ADD A</h3>
              <h3 className={`${headingLineAccent} text-2xl sm:text-3xl`}>CHARACTER</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {characters.map((ch) => {
              const selected = (bookingData.selectedCharacters || []).some((s) => s.character.id === ch.id);
              return (
                <motion.div
                  key={ch.id}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selected ? "border-amber-400 bg-white shadow-xl scale-[1.02]" : "border-transparent bg-white/80 hover:scale-[1.01]"
                  }`}
                  onClick={() => {
                    const list = bookingData.selectedCharacters || [];
                    if (selected) {
                      updateBookingData({ selectedCharacters: list.filter((s) => s.character.id !== ch.id) });
                    } else {
                      updateBookingData({ selectedCharacters: [...list, { character: ch, quantity: 1 }] });
                    }
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-2xl mb-2">{selected ? "✅" : "🎭"}</div>
                  <div className="text-base font-bold text-amber-900">{ch.name}</div>
                  <div className="text-sm font-semibold text-pink-600 mt-1">${ch.price.toFixed(2)}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {addons.length > 0 && (
        <div className="w-full max-w-md mt-10">
          <div className={headingStackClass + " text-center mb-4"}>
            <h2 className={`${headingLinePrimary} text-3xl md:text-4xl`}>FUN</h2>
            <h2 className={`${headingLineAccent} text-3xl md:text-4xl`}>ADD-ONS</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {addons.map((addon) => {
              const selected = (bookingData.selectedAddons || []).find((a) => a.addon.id === addon.id);
              const quantity = selected?.quantity ?? 0;
              return (
                <motion.div
                  key={addon.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    quantity > 0 ? "border-amber-400 bg-white shadow-md scale-[1.01]" : "border-transparent bg-white/80 hover:scale-[1.005]"
                  }`}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-bold text-amber-900">{addon.name}</div>
                      {!!addon.description && <div className="text-xs text-amber-700 mt-1">{addon.description}</div>}
                    </div>
                    <div className="text-sm font-semibold text-pink-600">${addon.price.toFixed(2)}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <label className="text-xs text-amber-800">Quantity</label>
                    <select
                      value={quantity}
                      onChange={(e) => {
                        const qty = Math.max(0, Math.min(10, parseInt(e.target.value) || 0));
                        const list = bookingData.selectedAddons || [];
                        const exists = list.find((sa) => sa.addon.id === addon.id);
                        if (qty === 0) {
                          updateBookingData({ selectedAddons: list.filter((sa) => sa.addon.id !== addon.id) });
                        } else if (exists) {
                          updateBookingData({
                            selectedAddons: list.map((sa) => (sa.addon.id === addon.id ? { ...sa, quantity: qty } : sa)),
                          });
                        } else {
                          updateBookingData({ selectedAddons: [...list, { addon, quantity: qty }] });
                        }
                      }}
                      className="border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const GuestCount = () => (
    <div className="h-full w-full flex flex-col items-center justify-center pt-10">
      {/* Title is rendered by HUD */}
      {(bookingData.selectedDate || bookingData.selectedTime || bookingData.selectedRoom || bookingData.selectedPackage) && (
        <div className="mb-4 text-center flex items-center justify-center gap-2 flex-wrap">
          {bookingData.selectedDate && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {new Date(bookingData.selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {bookingData.selectedTime && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {bookingData.selectedTime}
            </span>
          )}
          {bookingData.selectedRoom && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {bookingData.selectedRoom.name}
            </span>
          )}
          {bookingData.selectedPackage && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {bookingData.selectedPackage.name}
            </span>
          )}
        </div>
      )}
      <div className="flex items-center gap-6">
        <button
          onClick={() => updateBookingData({ guestCount: Math.max(1, bookingData.guestCount - 1) })}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white text-3xl font-bold hover:scale-110 transition shadow-lg"
        >
          −
        </button>
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-2xl"
          key={bookingData.guestCount}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.55 }}
        >
          <span className="text-5xl font-bold">{bookingData.guestCount}</span>
        </motion.div>
        <button
          onClick={() => updateBookingData({ guestCount: bookingData.guestCount + 1 })}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white text-3xl font-bold hover:scale-110 transition shadow-lg"
        >
          +
        </button>
      </div>
    </div>
  );

  const ParentInfo = () => (
    <div className="h-full w-full flex flex-col items-center justify-center pt-10">
      {/* Title is rendered by HUD */}
      {(bookingData.customerInfo.childName || bookingData.selectedDate || bookingData.selectedTime || bookingData.selectedRoom || bookingData.selectedPackage || (bookingData.selectedCharacters || []).length || (bookingData.selectedAddons || []).length) && (
        <div className="mb-4 text-center flex items-center justify-center gap-2 flex-wrap">
          {bookingData.customerInfo.childName && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {bookingData.customerInfo.childName}{bookingData.customerInfo.childAge ? ` (${bookingData.customerInfo.childAge})` : ''}
            </span>
          )}
          {bookingData.selectedDate && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {new Date(bookingData.selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {bookingData.selectedTime && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {bookingData.selectedTime}
            </span>
          )}
          {bookingData.selectedRoom && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {bookingData.selectedRoom.name}
            </span>
          )}
          {bookingData.selectedPackage && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {bookingData.selectedPackage.name}
            </span>
          )}
          {(bookingData.selectedCharacters || []).filter((c) => (c.quantity ?? 1) > 0).length > 0 && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {(bookingData.selectedCharacters || []).filter((c) => (c.quantity ?? 1) > 0).length} character(s)
            </span>
          )}
          {(bookingData.selectedAddons || []).filter((a) => a.quantity > 0).length > 0 && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {(bookingData.selectedAddons || []).filter((a) => a.quantity > 0).length} add-on(s)
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 w-full max-w-md">
        <input
          type="text"
          placeholder="Parent's Name"
          value={bookingData.customerInfo.parentName}
          onChange={(e) =>
            updateBookingData({ customerInfo: { ...bookingData.customerInfo, parentName: e.target.value } })
          }
          className={inputBaseClass}
        />
        <input
          type="email"
          placeholder="Parent's Email"
          value={bookingData.customerInfo.parentEmail}
          onChange={(e) =>
            updateBookingData({ customerInfo: { ...bookingData.customerInfo, parentEmail: e.target.value } })
          }
          className={inputBaseClass}
        />
        <input
          type="tel"
          placeholder="Parent's Phone"
          value={bookingData.customerInfo.parentPhone}
          onChange={(e) =>
            updateBookingData({ customerInfo: { ...bookingData.customerInfo, parentPhone: e.target.value } })
          }
          className={inputBaseClass}
        />
      </div>
    </div>
  );

  const SpecialNotes = () => (
    <div className="h-full w-full flex flex-col items-center justify-center pt-10">
      {/* Title is rendered by HUD */}
      {(bookingData.customerInfo.childName || bookingData.selectedDate || bookingData.selectedTime || bookingData.selectedRoom || bookingData.selectedPackage || (bookingData.selectedCharacters || []).length || (bookingData.selectedAddons || []).length) && (
        <div className="mb-4 text-center flex items-center justify-center gap-2 flex-wrap">
          {bookingData.customerInfo.childName && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {bookingData.customerInfo.childName}{bookingData.customerInfo.childAge ? ` (${bookingData.customerInfo.childAge})` : ''}
            </span>
          )}
          {bookingData.selectedDate && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {new Date(bookingData.selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {bookingData.selectedTime && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {bookingData.selectedTime}
            </span>
          )}
          {bookingData.selectedRoom && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {bookingData.selectedRoom.name}
            </span>
          )}
          {bookingData.selectedPackage && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {bookingData.selectedPackage.name}
            </span>
          )}
          {(bookingData.selectedCharacters || []).filter((c) => (c.quantity ?? 1) > 0).length > 0 && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {(bookingData.selectedCharacters || []).filter((c) => (c.quantity ?? 1) > 0).length} character(s)
            </span>
          )}
          {(bookingData.selectedAddons || []).filter((a) => a.quantity > 0).length > 0 && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/80 border-2 border-amber-300 text-amber-900 text-sm font-semibold">
              {(bookingData.selectedAddons || []).filter((a) => a.quantity > 0).length} add-on(s)
            </span>
          )}
        </div>
      )}
      <div className="w-full max-w-md">
        <textarea
          placeholder="Allergies, themes, decorations, etc."
          value={bookingData.specialNotes}
          onChange={(e) => updateBookingData({ specialNotes: e.target.value })}
          className={`${inputBaseClass} rounded-3xl h-40 resize-none`}
        />
      </div>
    </div>
  );

  const Payment = () => (
    <div className="h-full w-full flex flex-col items-center justify-center">
      {/* Title is rendered by HUD */}
      <div className="text-center mb-4">
        <p className={`${subheadingClass} mt-4`}>Pay a 50% deposit to lock in your date and time.</p>
        {typeof holdRemaining === "number" && holdRemaining > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">
            ⏳ Hold expires in <span className="tabular-nums">{fmtMMSS(holdRemaining)}</span>
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl bg-white/90 rounded-3xl p-6 shadow-lg">
        {/* Summary */}
        <h3 className="text-2xl text-amber-900 font-bold mb-2">Party Summary 🎉</h3>
        <div className="text-sm text-amber-800 mb-4">
          Review your details and secure your reservation.
        </div>

        <div className="space-y-2 text-amber-900">
          <div className="flex justify-between">
            <span>Birthday Star:</span>
            <span className="font-semibold">
              {bookingData.customerInfo.childName} (turning {bookingData.customerInfo.childAge}!)
            </span>
          </div>
          <div className="flex justify-between">
            <span>Date & Time:</span>
            <span className="font-semibold">
              {bookingData.selectedDate} • {bookingData.selectedTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Package:</span>
            <span className="font-semibold">{bookingData.selectedPackage?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Room:</span>
            <span className="font-semibold">{bookingData.selectedRoom?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Guest Count:</span>
            <span className="font-semibold">{bookingData.guestCount} kids</span>
          </div>

          {/* Line items */}
          {bookingData.selectedPackage && (
            <>
              <div className="flex justify-between pt-2">
                <span>Package ({bookingData.selectedPackage.base_kids} kids)</span>
                <span>${(bookingData.selectedPackage.base_price || 0).toFixed(2)}</span>
              </div>
              {Math.max(0, (bookingData.guestCount || 0) - (bookingData.selectedPackage.base_kids || 0)) > 0 && (
                <div className="flex justify-between">
                  <span>
                    Extra kids ×{" "}
                    {Math.max(0, (bookingData.guestCount || 0) - (bookingData.selectedPackage.base_kids || 0))}
                  </span>
                  <span>
                    ${(
                      Math.max(0, (bookingData.guestCount || 0) - (bookingData.selectedPackage.base_kids || 0)) *
                      (bookingData.selectedPackage.extra_kid_price || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              )}
              {(bookingData.selectedAddons || [])
                .filter((a) => a.quantity > 0)
                .map(({ addon, quantity }) => (
                  <div key={addon.id} className="flex justify-between">
                    <span>{addon.name} × {quantity}</span>
                    <span>${((addon.price || 0) * quantity).toFixed(2)}</span>
                  </div>
                ))}
              {(bookingData.selectedCharacters || [])
                .filter((c) => (c.quantity ?? 1) > 0)
                .map(({ character, quantity }) => (
                  <div key={character.id} className="flex justify-between">
                    <span>{character.name} × {quantity ?? 1}</span>
                    <span>${(((character.price || 0)) * (quantity ?? 1)).toFixed(2)}</span>
                  </div>
                ))}
              <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between text-base">
                <span className="font-semibold">Estimated Total</span>
                <span className="font-bold">${calculateTotal().toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="border-t border-gray-200 pt-4 mt-2">
            <div className="flex justify-between text-xl text-amber-900">
              <span>Deposit Required:</span>
              <span className="text-pink-600">${calculateDeposit().toFixed(2)}</span>
            </div>
            <p className="text-xs text-amber-700 mt-2">
              Remaining balance due on party day.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={prevStep}
            className="px-5 py-3 rounded-full border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 transition"
          >
            ← Back
          </button>
          <motion.button
            onClick={async () => {
              try {
                updateBookingData({ paymentStatus: "processing" });
                const { data, error } = await supabase.functions.invoke("createBooking", {
                  body: {
                    tenantSlug: tenant,
                    roomId: bookingData.selectedRoom?.id,
                    packageId: bookingData.selectedPackage?.id,
                    startTime: bookingData.selectedSlot?.timeStart,
                    endTime: bookingData.selectedSlot?.timeEnd,
                    childName: bookingData.customerInfo.childName,
                    childAge: bookingData.customerInfo.childAge,
                    parentName: bookingData.customerInfo.parentName,
                    email: bookingData.customerInfo.parentEmail,
                    phone: bookingData.customerInfo.parentPhone,
                    kids: bookingData.guestCount,
                    notes: bookingData.specialNotes,
                    holdId: hold?.id,
                    addons: (bookingData.selectedAddons || [])
                      .filter(({ quantity }) => quantity > 0)
                      .map(({ addon, quantity }) => ({ addonId: addon.id, quantity })),
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
                setHold(null);
                if (checkoutUrl) window.location.href = checkoutUrl;
                else setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
              } catch (e) {
                console.error("createBooking exception", e);
                updateBookingData({ paymentStatus: "failed" });
              }
            }}
            className={`text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full px-6 py-3 text-lg shadow-lg transition ${
              bookingData.paymentStatus === "processing" ? "opacity-70 cursor-not-allowed" : ""
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            disabled={
              bookingData.paymentStatus === "processing" ||
              !bookingData.selectedPackage ||
              !bookingData.selectedRoom ||
              !bookingData.selectedSlot ||
              !hold?.id
            }
          >
            {bookingData.paymentStatus === "processing" ? "Processing…" : "🚀 Secure My Party Spot!"}
          </motion.button>
        </div>

        <p className="text-xs text-amber-700 mt-3">
          By paying the 50% deposit you agree to our cancellation and refund policy. Deposits are refundable up to 7 days
          before the event and transferable subject to availability.
        </p>
      </div>
    </div>
  );

  const Confirmation = () => (
    <div className="h-full w-full flex flex-col items-center justify-center text-center">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-7xl md:text-8xl mb-6"
      >
        🎉
      </motion.div>
      {/* Title is rendered by HUD */}
      <p className={`${subheadingClass} mt-6`}>
        Watch your inbox for details. Can&apos;t wait to celebrate{" "}
        {bookingData.customerInfo.childName || "together"}!
      </p>

      <div className="bg-white/90 rounded-3xl p-6 max-w-md mx-auto mt-8 text-left">
        <h3 className="text-xl text-amber-900 mb-3">🎂 Party Details</h3>
        <div className="space-y-1 text-amber-800">
          <div>📅 {bookingData.selectedDate}</div>
          <div>⏰ {bookingData.selectedTime}</div>
          <div>🏠 {bookingData.selectedRoom?.name}</div>
          <div>👥 {bookingData.guestCount} guests</div>
        </div>
      </div>

      {bookingData.bookingId && (
        <div className="mt-4">
          <a
            href={`/${tenant}/waiver/${bookingData.bookingId}`}
            className="inline-block text-pink-600 font-bold underline"
          >
            Complete Waiver
          </a>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <button className="px-5 py-3 rounded-full bg-white/80 border border-amber-200 shadow-sm">
          📧 View Email Confirmation
        </button>
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
              selectedCharacters: [],
              specialNotes: "",
              paymentStatus: "pending",
            });
            setHold(null);
          }}
          className="px-5 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow"
        >
          🎪 Book Another Party
        </button>
      </div>
    </div>
  );

  // ────────────────────────────────────────────────────────────────────────────
  // Validation gating for Next button
  // ────────────────────────────────────────────────────────────────────────────
  function isNextDisabled() {
    switch (stepKey) {
      case "child-name":
        return !bookingData.customerInfo.childName.trim();
      case "child-age":
        return !bookingData.customerInfo.childAge || bookingData.customerInfo.childAge < 1;
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

  // Backgrounds per step (art-directed exports from Figma)
  const bg = useMemo(() => {
    // You can switch per step for custom art; for now reuse a set with minor variations
    const common = {
      mobile: "/assets/greeting/bg-mobile.png",
      tablet: "/assets/greeting/bg-tablet.png",
      desktop: "/assets/greeting/bg-desktop.png",
    };
    return common;
  }, [stepKey]);

  // HUD layer using shared HUD component
  // Dynamic single-line HUD title per step (no subtitle)
  const hudTitle = (() => {
    switch (stepKey) {
      case "child-name":
        return "WHO'S THE BIRTHDAY STAR?";
      case "child-age": {
        const name = (bookingData.customerInfo.childName || "THE STAR").toUpperCase();
        return `HOW OLD IS ${name} TURNING?`;
      }
      case "party-date":
        return "Pick your magical date";
      case "time-slot":
        return "Choose your perfect time";
      case "room-choice":
        return "Choose your epic room";
      case "package-choice":
        return "Select a party package";
      case "guest-count":
        return "How many party pals?";
      case "parent-info":
        return "Your contact info";
      case "special-notes":
        return "Special requests";
      case "payment":
        return "SECURE YOUR PARTY";
      case "confirmation":
        return "WOOHOO! YOU'RE BOOKED 🎊";
      default:
        return undefined;
    }
  })();

  const Hud = (
    <HUD
      currentStep={currentStep}
      totalSteps={STEPS.length}
      onPrev={prevStep}
      onNext={nextStep}
      title={hudTitle}
      isNextDisabled={isNextDisabled()}
      showNav={stepKey !== "greeting" && stepKey !== "payment" && stepKey !== "confirmation"}
      showProgress={stepKey !== "greeting"}
      contentOverflowY={(stepKey === "greeting" || stepKey === "party-date") ? 'visible' : 'auto'}
      showScrollBackdrop={stepKey !== "greeting"}
      holdId={hold?.id ?? null}
      holdRemaining={holdRemaining}
      fmtMMSS={fmtMMSS}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.25 }}
          className="h-full"
        >
          {stepKey === "greeting" && <GreetingStep onStart={nextStep} />}
          {stepKey === "child-name" && (
            <ChildNameStep
              value={bookingData.customerInfo.childName}
              onChange={(name) =>
                updateBookingData({ customerInfo: { ...bookingData.customerInfo, childName: name } })
              }
            />
          )}
          {stepKey === "child-age" && (
            <ChildAgeStep
              childName={bookingData.customerInfo.childName}
              value={bookingData.customerInfo.childAge}
              onChange={(age: number) =>
                updateBookingData({ customerInfo: { ...bookingData.customerInfo, childAge: age } })
              }
            />
          )}
          {stepKey === "party-date" && <PartyDate />}
          {stepKey === "time-slot" && <TimeSlot />}
          {stepKey === "room-choice" && <RoomChoice />}
          {stepKey === "package-choice" && <PackageChoice />}
          {stepKey === "guest-count" && <GuestCount />}
          {stepKey === "parent-info" && <ParentInfo />}
          {stepKey === "special-notes" && <SpecialNotesStep />}
          {stepKey === "payment" && <PaymentStep />}
          {stepKey === "confirmation" && <ConfirmationStep />}
        </motion.div>
      </AnimatePresence>
    </HUD>
  );

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300">
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

  const Scene = SceneByStep[stepKey];
  const bgs = getBackgroundsForStep(stepKey, tenant);

  // hudChars: characters rendered within the HUD overlay (test on child-name scene)
  const HudChars = (
    <>
      {stepKey === "greeting" && (
        <>
          <img
            src="/assets/greeting/wizzygreeting.png"
            alt="Wizzy"
            className="pointer-events-none select-none absolute bottom-20 left-[-50px] sm:left-[-50px] w-[60%] sm:w-[60%] md:w-[60%] max-w-[480px] z-40"
          />
          <img
            src="/assets/greeting/rufffsgreeting.png"
            alt="Ruffs"
            className="pointer-events-none select-none absolute bottom-24 right-0 w-[38%] max-w-[210px] z-40"
          />
        </>
      )}
      {stepKey === "child-name" && (
        <>
          <img
            src="/assets/child-name/wizzyWho.png"
            alt="Wizzy Who"
            className="pointer-events-none select-none absolute bottom-28 sm:bottom-32 md:bottom-36 left-[-40px] w-[60%] sm:w-[60%] md:w-[60%] max-w-[440px]"
          />
          <img
            src="/assets/child-name/ruffsWho.png"
            alt="Ruffs Who"
            className="pointer-events-none select-none absolute bottom-32 sm:bottom-36 md:bottom-40 right-0 w-[38%] max-w-[200px]"
          />
        </>
      )}
    </>
  );

  return (
    <ResponsiveStage
      bgMobile={bgs.mobile}
      bgTablet={bgs.tablet}
      bgDesktop={bgs.desktop}
      hudChars={HudChars}
      hud={Hud}
    >
      {Scene ? <Scene /> : null}
    </ResponsiveStage>
  );
}

