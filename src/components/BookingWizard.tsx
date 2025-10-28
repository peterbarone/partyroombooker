"use client";

import { useState, useEffect, useRef, ReactNode, Suspense, useMemo, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import { CharacterPlacements } from "@/config/character-placements";
import { Calendar as CalendarIcon, Users, Package as PackageIcon, MapPin, DollarSign, User as UserIcon, Mail, Phone, Baby } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ResponsiveStage from "@/components/layout/ResponsiveStage";
import HudCharacter from "@/components/layout/HudCharacter";
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

// ConfettiOrbCounter control (used by Child Age and Guest Count)
// Local definition to avoid adding a new file; uses Tailwind utilities + custom animations (see globals.css)

type OrbCounterProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (next: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

function ConfettiOrbCounter({
  value,
  min = 1,
  max = 30,
  step = 1,
  onChange,
  className = '',
  size = 'lg',
}: OrbCounterProps) {
  const labelId = useId();
  const [pulseKey, setPulseKey] = useState(0);
  const confettiRef = useRef<HTMLDivElement>(null);

  const sizes = {
    sm: { orb: 'w-28 h-28 text-3xl', btn: 'w-12 h-12 text-2xl', gap: 'gap-4' },
    md: { orb: 'w-36 h-36 text-4xl', btn: 'w-14 h-14 text-3xl', gap: 'gap-6' },
    lg: { orb: 'w-44 h-44 text-5xl', btn: 'w-16 h-16 text-4xl', gap: 'gap-8' },
  }[size];

  const atMin = value <= min;
  const atMax = value >= max;

  function nudge(dir: number) {
    const next = Math.min(max, Math.max(min, value + dir * step));
    if (next === value) return;
    onChange(next);
    setPulseKey((k) => k + 1);
    burst();
  }

  function burst() {
    const el = confettiRef.current;
    if (!el) return;
    el.classList.remove('confetti-burst');
    void el.offsetWidth;
    el.classList.add('confetti-burst');
  }

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft' || e.key === '-') nudge(-1);
    if (e.key === 'ArrowRight' || e.key === '+') nudge(1);
    if (e.key === 'PageDown') nudge(-5);
    if (e.key === 'PageUp') nudge(5);
    if (e.key === 'Home') onChange(min);
    if (e.key === 'End') onChange(max);
  }

  return (
    <div
      className={`flex items-center justify-center ${sizes.gap} ${className}`}
      aria-labelledby={labelId}
      role="group"
    >
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => nudge(-1)}
        disabled={atMin}
        className={`rounded-full ${sizes.btn} grid place-items-center font-bold text-white bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_10px_20px_rgba(255,0,90,0.25)] transition-transform active:scale-95 enabled:hover:translate-y-[-1px] disabled:opacity-40 disabled:cursor-not-allowed ring-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-portal-400/40`}
      >
        –
      </button>

      <div
        tabIndex={0}
        role="spinbutton"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label="Number of party pals"
        onKeyDown={onKey}
        className={`relative select-none ${sizes.orb} rounded-full grid place-items-center font-[800] text-white tracking-wide ring-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-portal-400/40`}
      >
        <div
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_55%)] before:absolute before:inset-[-6%] before:rounded-full before:bg-[conic-gradient(from_0deg,theme(colors.portal.400)_0%,theme(colors.portal.500)_40%,theme(colors.wizzy-purple.400)_70%,theme(colors.portal.400)_100%)] before:opacity-70 before:animate-orbSwirl after:absolute after:inset-0 after:rounded-full after:animate-orbTwinkles after:bg-[radial-gradient(circle,rgba(255,255,255,0.7)_0_1px,transparent_2px)] after:bg-[length:22px_22px] after:bg-center pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute inset-[6%] rounded-full bg-[#0C5E81] shadow-[0_0_28px_8px_rgba(79,174,242,0.35),inset_0_10px_30px_rgba(255,255,255,0.2)]"
          aria-hidden
        />
        <div
          className="absolute -inset-2 rounded-full blur-2xl bg-portal-400/40 pointer-events-none"
          aria-hidden
        />
        <span key={pulseKey} className="relative z-10 animate-numberPulse motion-reduce:animate-none">
          {value}
        </span>
        <div ref={confettiRef} className="pointer-events-none absolute inset-0" aria-hidden>
          {[...Array(8)].map((_, i) => (
            <span key={i} className="confetti-particle" style={{ ['--th' as any]: `${(i / 8) * 360}deg` }} />
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Increase"
        onClick={() => nudge(1)}
        disabled={atMax}
        className={`rounded-full ${sizes.btn} grid place-items-center font-bold text-white bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_10px_20px_rgba(255,0,90,0.25)] transition-transform active:scale-95 enabled:hover:translate-y-[-1px] disabled:opacity-40 disabled:cursor-not-allowed ring-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-portal-400/40`}
      >
        +
      </button>
    </div>
  );
}

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  Shared style tokens
 * ──────────────────────────────────────────────────────────────────────────────
 */
const inputBaseClass =
  "input px-5 py-4 md:px-8 md:py-5 rounded-3xl font-medium tracking-wide text-lg md:text-xl shadow-parchment hover:shadow-lift focus:shadow-glow transition";

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

type StepProps = {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
};

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
const SceneByStep: Record<StepKey, React.ComponentType<any>> = {
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

// Step Components
const ChildName: React.FC<StepProps> = ({ bookingData, updateBookingData }) => (
  <div className="h-full w-full flex flex-col items-center justify-center @container">
    {/* Title is rendered by HUD */}
    <div className="w-full max-w-md">
      <input
        type="text"
        placeholder="Enter your child's name"
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

const ChildAge: React.FC<StepProps> = ({ bookingData, updateBookingData }) => (
  <div className="h-full w-full flex flex-col items-center justify-center">
    <ConfettiOrbCounter
      value={bookingData.customerInfo.childAge || 1}
      min={1}
      max={18}
      step={1}
      size="lg"
      onChange={(age) =>
        updateBookingData({
          customerInfo: { ...bookingData.customerInfo, childAge: age },
        })
      }
    />
  </div>
);

const PartyDate: React.FC<StepProps> = ({ bookingData, updateBookingData }) => (
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

const ParentInfo: React.FC<StepProps> = ({ bookingData, updateBookingData }) => (
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

const SpecialNotes: React.FC<StepProps> = ({ bookingData, updateBookingData }) => (
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

  // Preview modal state for room images
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewTitle, setPreviewTitle] = useState<string>("");

  // Helpers
  const fmtMMSS = (secs: number) => {
    const m = Math.max(0, Math.floor(secs / 60));
    const s = Math.max(0, secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const nextStep = () => setCurrentStep((i) => Math.min(i + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((i) => Math.max(i - 1, 0));
  const stepKey: StepKey = STEPS[currentStep];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleEnter = () => setCurrentStep((i) => Math.min(i + 1, STEPS.length - 1));
    window.addEventListener("bookingwizard:enter", handleEnter);
    return () => {
      window.removeEventListener("bookingwizard:enter", handleEnter);
    };
  }, []);

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
          .select("id,name,description,max_kids,images,active")
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
          images: Array.isArray(r.images) ? r.images : (r.images ? [r.images] : []),
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
      <p className="text-lg sm:text-xl text-gray-800 mb-6 md:mb-4">
        Let&apos;s plan the most AMAZING party ever! 🎈
      </p>
      <p className="text-base sm:text-lg text-gray-700 max-w-xl">
        Tap the huge <strong>Enter the party portal!</strong> button below to jump right into the fun.
      </p>
    </div>
  );

  const TimeSlot = () => (
    <div className="h-full w-full flex flex-col items-center justify-center">
      {/* Title is rendered by HUD */}
      {!bookingData.selectedDate && (
        <div className="mb-4 text-center text-amber-900 font-semibold">Pick a date first</div>
      )}
      {!!bookingData.selectedDate && (
        <div className="mb-5 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/90 border-[3px] border-amber-400 shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-amber-900 text-sm font-extrabold">
            {new Date(bookingData.selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      )}
      <div className="w-full max-w-md flex flex-col gap-3 -mt-2">
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
                className={`relative w-full p-3.5 md:p-4 rounded-3xl border-2 transition-all bg-wiz-purple-400 shadow-parchment ${
                  isSelected
                    ? `bg-white ring-4 ring-cyan-300 border-cyan-500 shadow-[0_4px_14px_rgba(0,0,0,0.18)] scale-[1.01]`
                    : `border-cyan-400 hover:border-cyan-300 hover:ring-2 hover:ring-cyan-200 hover:shadow-lift hover:scale-[1.01]`
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                animate={
                  isSelected
                    ? {
                        rotate: [0, -5, 5, -5, 0],
                        boxShadow: [
                          "0px 4px 14px rgba(0,0,0,0.18), 0 0 0 0 rgba(34,211,238,0.25)",
                          "0px 4px 14px rgba(0,0,0,0.18), 0 0 0 10px rgba(34,211,238,0.12)",
                          "0px 4px 14px rgba(0,0,0,0.18), 0 0 0 0 rgba(34,211,238,0.25)",
                        ],
                        transition: { duration: 0.8, ease: "easeInOut" },
                      }
                    : undefined
                }
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.15, 1] }}
                    transition={{ duration: 0.5 }}
                    className="absolute -top-3 -left-3 z-10 w-8 h-8 rounded-full bg-cyan-500 text-white grid place-items-center shadow-lg"
                  >
                    ✓
                  </motion.div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Cartoon-like clock icon with thicker stroke and warm cast */}
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <defs>
                        <linearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E6FBFF" />
                          <stop offset="100%" stopColor="#DFF7FF" />
                        </linearGradient>
                      </defs>
                      <circle cx="12" cy="12" r="9" fill="url(#faceGrad)" stroke="#0EA5B7" strokeWidth="2.6" />
                      <circle cx="12" cy="12" r="1.9" fill="#0EA5B7" />
                      <path d="M12 6.2v5.6l4 1.9" stroke="#0EA5B7" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8.3 3.6l1.6 1.6M15.7 3.6L14.1 5.2" stroke="#0EA5B7" strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                    <div className="font-party text-white text-lg md:text-xl font-extrabold tracking-wide drop-shadow-sm" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{label}</div>
                  </div>
                  <span className="relative font-party text-xs md:text-sm px-3 py-1 rounded-full bg-wiz-purple-600 text-white border border-wiz-purple-500 shadow-sm">
                    <motion.span
                      className="mr-1 inline-block"
                      animate={{ opacity: isSelected ? [0.7, 1, 0.7] : 0.8, rotate: isSelected ? [0, 10, -10, 0] : 0, scale: isSelected ? [0.95, 1, 0.95] : 1 }}
                      transition={isSelected ? { duration: 1.4, repeat: Infinity } : { duration: 0.3 }}
                    >
                      ✨
                    </motion.span>
                    {(slot.rooms || []).filter((r) => r.available && r.eligible).length} rooms
                  </span>
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
          images: (rooms || []).find((rr) => rr.id === r.roomId)?.images || [],
        }))
      : (rooms || []).map((r) => ({
          id: r.id,
          name: r.name,
          max_kids: r.max_kids,
          available: true,
          eligible: true,
          images: r.images || [],
        }));

    const listCount = list.length;

    const getRoomColorClasses = (name: string) => {
      const n = (name || "").toLowerCase();
      if (n.includes("red")) return { ring: "ring-red-300", border: "border-red-400", glow: "shadow-[0_0_24px_rgba(239,68,68,0.35)]" };
      if (n.includes("blue")) return { ring: "ring-blue-300", border: "border-blue-400", glow: "shadow-[0_0_24px_rgba(59,130,246,0.35)]" };
      if (n.includes("green")) return { ring: "ring-green-300", border: "border-green-400", glow: "shadow-[0_0_24px_rgba(34,197,94,0.35)]" };
      if (n.includes("yellow")) return { ring: "ring-yellow-300", border: "border-yellow-400", glow: "shadow-[0_0_24px_rgba(234,179,8,0.35)]" };
      if (n.includes("purple")) return { ring: "ring-purple-300", border: "border-purple-400", glow: "shadow-[0_0_24px_rgba(168,85,247,0.35)]" };
      if (n.includes("orange")) return { ring: "ring-orange-300", border: "border-orange-400", glow: "shadow-[0_0_24px_rgba(249,115,22,0.35)]" };
      if (n.includes("pink")) return { ring: "ring-pink-300", border: "border-pink-400", glow: "shadow-[0_0_24px_rgba(236,72,153,0.35)]" };
      return { ring: "ring-amber-200", border: "border-amber-300", glow: "shadow-[0_0_20px_rgba(245,158,11,0.25)]" };
    };

    return (
      <div className="h-full w-full flex flex-col items-center justify-center px-8 py-4">
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
        {listCount === 0 && (
          <div className="text-amber-800 text-center mb-4">No rooms available for this time. Try another time or date.</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 w-full max-w-3xl max-h-[55vh] overflow-y-auto pr-1">
          {list.map((room) => {
            const isDisabled = !room.available || !room.eligible;
            const selected = bookingData.selectedRoom?.id === room.id;
            const color = getRoomColorClasses(room.name);
            return (
            <motion.div
              key={room.id}
              className={`relative p-4 rounded-3xl border-2 transition-all bg-wiz-purple-400 shadow-2xl scale-60 text-center ${
                selected
                  ? `bg-white ring-4 ring-cyan-300 border-cyan-500 scale-[1.01]`
                  : isDisabled
                  ? `border-red-400`
                  : `border-cyan-400 hover:border-cyan-300 hover:ring-2 hover:ring-cyan-200 hover:shadow-lift hover:scale-[1.01]`
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
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.15, 1] }}
                  transition={{ duration: 0.5 }}
                  className="absolute -top-3 -left-3 z-10 w-8 h-8 rounded-full bg-cyan-500 text-white grid place-items-center shadow-lg"
                >
                  ✓
                </motion.div>
              )}
              {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-red-600 text-white font-extrabold text-xl px-6 py-2 transform rotate-45 shadow-lg border-2 border-red-800">
                    UNAVAILABLE
                  </div>
                </div>
              )}
              <div className="font-party text-white text-lg font-extrabold tracking-wide mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{room.name}</div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-xs px-3 py-1 rounded-full bg-wiz-purple-600 text-white border border-wiz-purple-500 shadow-sm">🎉 Up to {room.max_kids} kids</span>
                {!room.eligible && (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-500 text-white border border-red-400">Not eligible</span>
                )}
              </div>
              {!isDisabled && (
                <button
                  type="button"
                  className="mb-3 bg-wiz-purple-500 hover:bg-wiz-purple-400 text-white px-3 py-2 rounded-full text-sm font-medium transition shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewImages(Array.isArray(room.images) ? room.images : []);
                    setPreviewIndex(0);
                    setPreviewTitle(room.name);
                    setPreviewOpen(true);
                  }}
                  aria-label="Tap to preview"
                >
                  👁️ Preview Room
                </button>
              )}
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-300">
                <div className="aspect-[4/3] w-full bg-amber-100/40 flex items-center justify-center">
                  {Array.isArray(room.images) && room.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-amber-700 text-sm">No photo</div>
                  )}
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
        {list.length > 4 && (
          <motion.div
            className="mt-6 text-center text-white font-party text-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <div>Scroll for more rooms</div>
            <div className="text-3xl mt-2">⬇️</div>
          </motion.div>
        )}
        {previewOpen && (
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="relative w-full max-w-3xl">
              <button
                type="button"
                aria-label="Close preview"
                className="absolute -top-3 -right-3 bg-amber-200 text-amber-900 border-2 border-amber-500 rounded-full w-10 h-10 font-extrabold shadow-lg"
                onClick={() => setPreviewOpen(false)}
              >
                ×
              </button>
              <div className="rounded-2xl overflow-hidden border-4 border-amber-400 bg-gradient-to-b from-white to-[#FFF8E6] shadow-2xl">
                <div className="relative aspect-[16/10] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewImages[previewIndex]} alt={previewTitle} className="absolute inset-0 w-full h-full object-contain bg-black/5" />
                </div>
                <div className="flex items-center justify-between p-2 bg-white/70">
                  <button
                    className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 shadow-sm"
                    onClick={() => setPreviewIndex((i) => (i - 1 + previewImages.length) % previewImages.length)}
                  >
                    ◀ Prev
                  </button>
                  <div className="font-party text-amber-900 font-extrabold">{previewTitle}</div>
                  <button
                    className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 shadow-sm"
                    onClick={() => setPreviewIndex((i) => (i + 1) % previewImages.length)}
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const PackageChoice = () => {
    const packageRef = useRef<HTMLDivElement>(null);


    return (
      <div ref={packageRef} className="h-full w-full flex flex-col items-center justify-start pt-20">
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
      {packages.length === 0 && (
        <div className="text-amber-800 text-center mb-4">No packages available. Make sure your tenant has active packages in Supabase.</div>
      )}
      <div className="mt-4 grid grid-cols-1 gap-12 w-full max-w-md">
        {packages.map((pkg, index) => {
          const isSelected = bookingData.selectedPackage?.id === pkg.id;
          const isPopular = index === 0; // Assume first is most popular
          return (
            <motion.div
              key={pkg.id}
              className={`relative p-4 rounded-3xl border-4 border-cyan-300 transition-all bg-purple-200 shadow-2xl scale-60 text-center cursor-pointer overflow-hidden ${
                isSelected
                  ? "border-cyan-400 bg-white scale-[1.01] ring-4 ring-cyan-300"
                  : "hover:scale-[1.01] hover:ring-2 hover:ring-cyan-200 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              }`}
              style={{
                background: isSelected ? 'white' : 'rgba(139,92,246,0.9)',
                borderImage: 'linear-gradient(45deg, #a78bfa, #06b6d4) 1'
              }}
              onClick={() => updateBookingData({ selectedPackage: pkg })}
              whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(34,211,238,0.5)" }}
              whileTap={{ scale: 0.98 }}
              animate={isSelected ? { rotate: [0, -2, 2, 0] } : undefined}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.15, 1] }}
                  transition={{ duration: 0.5 }}
                  className="absolute -top-3 -left-3 z-10 w-8 h-8 rounded-full bg-cyan-500 text-white grid place-items-center shadow-lg"
                >
                  ✓
                </motion.div>
              )}
              {isPopular && !isSelected && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                  🥇 Most Popular
                </div>
              )}
              <div className={`text-xl font-extrabold mb-1 ${isSelected ? 'text-amber-900' : 'text-white'}`}>{pkg.name}</div>
              <div className={`text-sm font-medium mb-3 ${isSelected ? 'text-amber-800' : 'text-white'}`}>
                {pkg.name.toLowerCase().includes('deluxe') ? '🎎 Best for families' : pkg.name.toLowerCase().includes('bounce') ? '🎈 Fun for young kids' : '⭐ Classic choice'}
              </div>
              <div className={`text-lg font-bold mb-1 ${isSelected ? 'text-pink-600' : 'text-white'}`}>${pkg.base_price.toFixed(2)}</div>
              <div className={`text-xs mb-4 ${isSelected ? 'text-amber-700' : 'text-white'}`}>
                {Math.max(1, Math.round((pkg.duration_min || 120) / 60))} hrs • up to {pkg.base_kids} kids
              </div>
              <div className="relative mb-4">
                <div className="h-px bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
              </div>
              <div className="text-left mb-4">
                <div className={`text-sm font-semibold mb-3 ${isSelected ? 'text-amber-900' : 'text-white'}`}>What&apos;s included:</div>
                <ul className={`text-xs space-y-2 ${isSelected ? 'text-amber-700' : 'text-white'}`} style={{ lineHeight: '1.8' }}>
                  <li>🏠 Private party room</li>
                  <li>🎭 Dedicated party host</li>
                  <li>🍕 Pizza & drinks</li>
                  <li>🎈 Balloon bundle</li>
                  <li>🎟️ Return pass for birthday child</li>
                </ul>
              </div>
              <div className="flex gap-2 justify-center px-4">
                <button
                  className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-medium hover:bg-pink-600 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateBookingData({ selectedPackage: pkg });
                  }}
                >
                  Select Package ➜
                </button>
                <button
                  className="flex-1 px-4 py-2 border border-amber-400 text-amber-800 bg-amber-50 rounded-full text-sm font-medium hover:bg-amber-100 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Open details modal
                  }}
                >
                  View Details
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {characters.length > 0 && (
        <div className="w-full max-w-md mt-10">
          <div className="text-center mb-2">
            <div className="space-y-1 font-party font-extrabold tracking-tight drop-shadow-sm">
              <h3 className="text-amber-800 leading-tight text-2xl sm:text-3xl">ADD A</h3>
              <h3 className="text-pink-600 leading-tight text-2xl sm:text-3xl">CHARACTER</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-12">
            {characters.map((ch) => {
              const selected = (bookingData.selectedCharacters || []).some((s) => s.character.id === ch.id);
              return (
                <motion.div
                  key={ch.id}
                  className={`relative p-4 rounded-3xl border-2 transition-all bg-wiz-purple-400 shadow-2xl scale-60 cursor-pointer ${
                    selected ? "border-amber-400 bg-white scale-[1.01]" : "border-transparent bg-white/80 hover:scale-[1.01]"
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
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-300 bg-amber-100/40 flex items-center justify-center">
                      <div className="text-2xl">🎭</div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-base font-bold text-amber-900">{ch.name}</div>
                      <div className="text-sm font-semibold text-pink-600 mt-1">${ch.price.toFixed(2)}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {addons.length > 0 && (
        <div className="w-full max-w-md mt-10">
          <div className="space-y-1 font-party font-extrabold tracking-tight drop-shadow-sm text-center mb-4">
            <h2 className="text-amber-800 leading-tight text-3xl md:text-4xl">FUN</h2>
            <h2 className="text-pink-600 leading-tight text-3xl md:text-4xl">ADD-ONS</h2>
          </div>
          <div className="grid grid-cols-1 gap-12">
          {(() => {
            const handleAddonQuantityChange = (addon: Addon, e: React.ChangeEvent<HTMLSelectElement>) => {
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
            };

            return addons.map((addon) => {
              const selected = (bookingData.selectedAddons || []).find((a) => a.addon.id === addon.id);
              const quantity = selected?.quantity ?? 0;
              return (
                <motion.div
                  key={addon.id}
                  className={`relative p-4 rounded-3xl border-2 transition-all bg-wiz-purple-400 shadow-2xl scale-60 cursor-pointer ${
                    quantity > 0 ? "border-amber-400 bg-white scale-[1.01]" : "border-transparent bg-white/80 hover:scale-[1.01]"
                  }`}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-300 bg-amber-100/40 flex items-center justify-center">
                      <div className="text-2xl">🎉</div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-base font-bold text-amber-900">{addon.name}</div>
                      <div className="text-sm font-semibold text-pink-600 mt-1">${addon.price.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-amber-800">Quantity</label>
                    <select
                      value={quantity}
                      onChange={(e) => handleAddonQuantityChange(addon, e)}
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
            });
          })()}
        </div>
        </div>
      )}
    </div>
  );
  };

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
      <div className="mt-2">
        <ConfettiOrbCounter
          value={bookingData.guestCount}
          min={1}
          max={30}
          step={1}
          size="lg"
          onChange={(n) => updateBookingData({ guestCount: n })}
        />
      </div>
    </div>
  );

  const Payment = () => (
    <div className="h-full w-full flex flex-col items-center justify-center">
      {/* Title is rendered by HUD */}
      {typeof holdRemaining === "number" && holdRemaining > 0 && (
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">
          ⏳ Hold expires in <span className="tabular-nums">{fmtMMSS(holdRemaining)}</span>
        </div>
      )}

      <div className="w-full max-w-3xl bg-white/90 rounded-3xl p-6 shadow-lg">
        {/* Summary */}
        <h3 className="text-2xl text-amber-900 font-bold mb-2">Party Summary 🎉</h3>
        <div className="text-sm text-amber-800 mb-4">
          Pay a 50% deposit to lock in your date and time.
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

  const Confirmation = () => {
    return (
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
  };

  // HUD layer using shared HUD component
  // Dynamic single-line HUD title per step (no subtitle)
  const hudTitle = (() => {
    switch (stepKey) {
      case "greeting":
        return "PARTY WITH,";
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

  // Compact live summary for HUD drawer
  const summaryNode = (
    <div className="text-amber-900 text-sm space-y-3">
      {bookingData.selectedPackage && (
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <PackageIcon className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900">{bookingData.selectedPackage.name}</p>
              {bookingData.selectedPackage.description && (
                <p className="text-xs text-gray-600">{bookingData.selectedPackage.description}</p>
              )}
            </div>
          </div>

          {bookingData.selectedRoom && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="text-gray-700">{bookingData.selectedRoom.name}</span>
            </div>
          )}

          {(bookingData.selectedDate || bookingData.selectedTime) && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="text-gray-700">
                {bookingData.selectedDate
                  ? new Date(bookingData.selectedDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                  : ''}
                {bookingData.selectedTime ? ` at ${bookingData.selectedTime}` : ''}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span className="text-gray-700">{bookingData.guestCount} kids</span>
          </div>

          {(bookingData.selectedAddons || []).filter(a => a.quantity > 0).length > 0 && (
            <div className="border-t border-amber-100 pt-2 mt-2">
              <p className="font-semibold text-amber-900 text-xs mb-1">Add-ons:</p>
              {bookingData.selectedAddons.filter(a => a.quantity > 0).map(({ addon, quantity }) => (
                <div key={addon.id} className="flex justify-between text-xs text-gray-700 ml-6">
                  <span>{addon.name} x{quantity}</span>
                  <span>${((addon.price || 0) * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {bookingData.customerInfo && (
        <div className="border-t border-amber-100 pt-2 space-y-2">
          {bookingData.customerInfo.parentName && (
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="text-gray-700">{bookingData.customerInfo.parentName}</span>
            </div>
          )}
          {bookingData.customerInfo.parentEmail && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="text-gray-700 text-xs">{bookingData.customerInfo.parentEmail}</span>
            </div>
          )}
          {bookingData.customerInfo.parentPhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="text-gray-700">{bookingData.customerInfo.parentPhone}</span>
            </div>
          )}
          {bookingData.customerInfo.childName && (
            <div className="flex items-center gap-2">
              <Baby className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="text-gray-700">
                {bookingData.customerInfo.childName}
                {bookingData.customerInfo.childAge ? ` (${bookingData.customerInfo.childAge} years)` : ''}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="border-t-2 border-amber-200 pt-2 mt-2">
        <div className="flex items-center justify-between font-bold text-amber-900">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            <span>Total:</span>
          </div>
          <span className="text-lg">${calculateTotal().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  const Hud = stepKey === "greeting" ? (
    <HUD
      currentStep={currentStep}
      totalSteps={STEPS.length}
      onPrev={prevStep}
      onNext={nextStep}
      holdId={hold?.id}
      holdRemaining={holdRemaining}
      fmtMMSS={fmtMMSS}
      title={hudTitle}
      contentOverflowY="visible"
      showNav={false}
      summary={summaryNode}
    >
      <GreetingStep onStart={nextStep} />
    </HUD>
  ) : (
    <HUD
      currentStep={currentStep}
      totalSteps={STEPS.length}
      onPrev={prevStep}
      onNext={nextStep}
      holdId={hold?.id}
      holdRemaining={holdRemaining}
      fmtMMSS={fmtMMSS}
      title={hudTitle}
      summary={summaryNode}
    >
      {(() => {
        switch (stepKey) {
          case "child-name":
            return <ChildName bookingData={bookingData} updateBookingData={updateBookingData} />;
          case "child-age":
            return <ChildAge bookingData={bookingData} updateBookingData={updateBookingData} />;
          case "party-date":
            return <PartyDate bookingData={bookingData} updateBookingData={updateBookingData} />;
          case "time-slot":
            return <TimeSlot />;
          case "room-choice":
            return <RoomChoice />;
          case "package-choice":
            return <PackageChoice />;
          case "guest-count":
            return <GuestCount />;
          case "parent-info":
            return <ParentInfo bookingData={bookingData} updateBookingData={updateBookingData} />;
          case "special-notes":
            return <SpecialNotes bookingData={bookingData} updateBookingData={updateBookingData} />;
          case "payment":
            return <Payment />;
          case "confirmation":
            return <Confirmation />;
          default:
            return null;
        }
      })()}
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

  const HudChars = (() => {
    const entry = (CharacterPlacements as any)[stepKey] || {};
    const wiz = (entry as any).wizzy;
    const ruffs = (entry as any).ruffs;
    return (
      <>
        {wiz && (
          <HudCharacter
            src={wiz.src}
            alt="Wizzy"
            anchor={wiz.anchor}
            preset={wiz.preset}
            bottom={wiz.bottom}
            offset={wiz.offset}
            scale={wiz.scale}
            translateX={wiz.translateX}
            translateY={wiz.translateY}
            origin={wiz.origin}
          />
        )}
        {ruffs && (
          <HudCharacter
            src={ruffs.src}
            alt="Ruffs"
            anchor={ruffs.anchor}
            preset={ruffs.preset}
            bottom={ruffs.bottom}
            offset={ruffs.offset}
            scale={ruffs.scale}
            translateX={ruffs.translateX}
            translateY={ruffs.translateY}
            origin={ruffs.origin}
          />
        )}
      </>
    );
  })();

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

