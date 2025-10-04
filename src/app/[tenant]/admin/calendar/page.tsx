"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../../../components/AdminLayout";
import { supabase } from "@/lib/supabase";

interface CalendarProps {
  params: { tenant: string };
}

type UIEvent = {
  id: string;
  title: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room: string;
  package: string;
  status: string;
  kidsCount: number;
  color: string; // tailwind bg color
};

type CalendarView = "month" | "week" | "day";

const CalendarHeader = ({
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
}: {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}) => {
  const formatTitle = () => {
    const options: Intl.DateTimeFormatOptions =
      view === "month"
        ? { year: "numeric", month: "long" }
        : view === "week"
        ? { year: "numeric", month: "short", day: "numeric" }
        : { year: "numeric", month: "long", day: "numeric" };

    return currentDate.toLocaleDateString("en-US", options);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-900">{formatTitle()}</h1>
        <button
          onClick={onToday}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Today
        </button>
      </div>

      <div className="flex items-center space-x-4">
        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onPrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            &#8249;
          </button>
          <button
            onClick={onNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            &#8250;
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(["month", "week", "day"] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                view === v
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* New Booking Button */}
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + New Booking
        </button>
      </div>
    </div>
  );
};

const BookingEvent = ({
  booking,
  onClick,
}: {
  booking: UIEvent;
  onClick: (booking: UIEvent) => void;
}) => {
  return (
    <div
      onClick={() => onClick(booking)}
      className={`${booking.color} text-white text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity mb-1`}
    >
      <div className="font-medium truncate">
        {booking.startTime} - {booking.customerName}
      </div>
      <div className="truncate opacity-90">{booking.room}</div>
    </div>
  );
};

const MonthView = ({
  currentDate,
  bookings,
  onBookingClick,
}: {
  currentDate: Date;
  bookings: UIEvent[];
  onBookingClick: (booking: UIEvent) => void;
}) => {
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());

  const days = [];
  const current = new Date(startOfCalendar);

  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return bookings.filter((booking) => booking.date === dateStr);
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Day Headers */}
      <div className="grid grid-cols-7 bg-gray-50">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-gray-700"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const dayBookings = getBookingsForDate(date);
          return (
            <div
              key={index}
              className={`h-32 border-r border-b border-gray-200 p-2 ${
                !isCurrentMonth(date) ? "bg-gray-50 text-gray-400" : ""
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday(date)
                    ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    : ""
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1 overflow-hidden">
                {dayBookings.slice(0, 3).map((booking) => (
                  <BookingEvent
                    key={booking.id}
                    booking={booking}
                    onClick={onBookingClick}
                  />
                ))}
                {dayBookings.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayBookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WeekView = ({
  currentDate,
  bookings,
  onBookingClick,
}: {
  currentDate: Date;
  bookings: UIEvent[];
  onBookingClick: (booking: UIEvent) => void;
}) => {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }

  const timeSlots = [];
  for (let hour = 9; hour <= 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return bookings.filter((booking) => booking.date === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Day Headers */}
      <div className="grid grid-cols-8 bg-gray-50">
        <div className="p-3"></div>
        {weekDays.map((date, index) => (
          <div
            key={index}
            className={`p-3 text-center border-l border-gray-200 ${
              isToday(date) ? "bg-blue-50" : ""
            }`}
          >
            <div className="text-sm font-medium text-gray-700">
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </div>
            <div
              className={`text-lg font-bold ${
                isToday(date)
                  ? "bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mt-1"
                  : "text-gray-900"
              }`}
            >
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="max-h-96 overflow-y-auto">
        {timeSlots.map((time, timeIndex) => (
          <div key={time} className="grid grid-cols-8 border-b border-gray-100">
            <div className="p-2 text-sm text-gray-500 bg-gray-50 border-r border-gray-200">
              {time}
            </div>
            {weekDays.map((date, dayIndex) => {
              const dayBookings = getBookingsForDate(date);
              const timeBookings = dayBookings.filter((booking) =>
                booking.startTime.startsWith(time.substring(0, 2))
              );

              return (
                <div
                  key={dayIndex}
                  className="p-1 border-l border-gray-200 min-h-[60px]"
                >
                  {timeBookings.map((booking) => (
                    <BookingEvent
                      key={booking.id}
                      booking={booking}
                      onClick={onBookingClick}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const DayView = ({
  currentDate,
  bookings,
  onBookingClick,
}: {
  currentDate: Date;
  bookings: UIEvent[];
  onBookingClick: (booking: UIEvent) => void;
}) => {
  const timeSlots = [];
  for (let hour = 9; hour <= 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  const dayBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    return bookingDate.toDateString() === currentDate.toDateString();
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Day Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h2>
        <p className="text-sm text-gray-600">{dayBookings.length} bookings</p>
      </div>

      {/* Time Slots */}
      <div className="max-h-96 overflow-y-auto">
        {timeSlots.map((time) => {
          const timeBookings = dayBookings.filter((booking) =>
            booking.startTime.startsWith(time.substring(0, 2))
          );

          return (
            <div key={time} className="flex border-b border-gray-100">
              <div className="w-20 p-3 text-sm text-gray-500 bg-gray-50 border-r border-gray-200">
                {time}
              </div>
              <div className="flex-1 p-3 min-h-[80px]">
                <div className="space-y-2">
                  {timeBookings.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => onBookingClick(booking)}
                      className={`${booking.color} text-white p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity`}
                    >
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="text-sm opacity-90">
                        {booking.startTime} - {booking.endTime} • {booking.room}
                      </div>
                      <div className="text-sm opacity-90">
                        {booking.package} • {booking.kidsCount} kids
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BookingDetailModal = ({
  booking,
  isOpen,
  onClose,
}: {
  booking: UIEvent | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Booking Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Customer
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {booking.customerName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <p className="text-gray-900">
                {new Date(booking.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <p className="text-gray-900">
                {booking.startTime} - {booking.endTime}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Package & Room
            </label>
            <p className="text-gray-900">
              {booking.package} in {booking.room}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kids Count
              </label>
              <p className="text-gray-900">{booking.kidsCount} children</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  booking.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "pending_payment"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {booking.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Edit Booking
            </button>
            <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CalendarView({ params }: CalendarProps) {
  const tenant = params.tenant;
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<UIEvent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Load events around the current month (previous 1 week to next 6 weeks)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: tenantRow } = await supabase
          .from("tenants")
          .select("id")
          .eq("slug", tenant)
          .eq("active", true)
          .single();
        if (!tenantRow?.id) {
          setEvents([]);
          return;
        }

        const startRange = new Date(currentDate);
        startRange.setDate(startRange.getDate() - 7);
        const endRange = new Date(currentDate);
        endRange.setDate(endRange.getDate() + 42);

        const { data: raw } = await supabase
          .from("bookings")
          .select("id, customer_id, package_id, room_id, start_time, end_time, status, kids_count")
          .eq("tenant_id", tenantRow.id)
          .gte("start_time", startRange.toISOString())
          .lte("start_time", endRange.toISOString());

        const customerIds = Array.from(new Set((raw || []).map((b: any) => b.customer_id)));
        const packageIds = Array.from(new Set((raw || []).map((b: any) => b.package_id)));
        const roomIds = Array.from(new Set((raw || []).map((b: any) => b.room_id)));

        const [customersRes, packagesRes, roomsRes] = await Promise.all([
          customerIds.length ? supabase.from("customers").select("id,name").in("id", customerIds) : Promise.resolve({ data: [] as any[] }),
          packageIds.length ? supabase.from("packages").select("id,name").in("id", packageIds) : Promise.resolve({ data: [] as any[] }),
          roomIds.length ? supabase.from("rooms").select("id,name").in("id", roomIds) : Promise.resolve({ data: [] as any[] }),
        ]);

        const customers = new Map((customersRes.data || []).map((c: any) => [c.id, c.name]));
        const packages = new Map((packagesRes.data || []).map((p: any) => [p.id, p.name]));
        const rooms = new Map((roomsRes.data || []).map((r: any) => [r.id, r.name]));

        const colorForStatus = (status: string) => {
          if (status === "confirmed") return "bg-green-500";
          if (status === "pending" || status === "pending_payment") return "bg-yellow-500";
          if (status === "cancelled") return "bg-red-500";
          return "bg-blue-500";
        };

        const mapped: UIEvent[] = (raw || []).map((b: any) => {
          const start = new Date(b.start_time);
          const end = new Date(b.end_time);
          const date = start.toISOString().split("T")[0];
          const startTime = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
          const endTime = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
          const customerName = customers.get(b.customer_id) || "Customer";
          const pkgName = packages.get(b.package_id) || "Package";
          const roomName = rooms.get(b.room_id) || "Room";
          return {
            id: b.id,
            title: `${customerName} - ${pkgName}`,
            customerName,
            date,
            startTime,
            endTime,
            room: roomName,
            package: pkgName,
            status: b.status,
            kidsCount: Number(b.kids_count || 0),
            color: colorForStatus(b.status),
          };
        });

        setEvents(mapped);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenant, currentDate]);

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleBookingClick = (booking: UIEvent) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout tenant={tenant}>
      <div className="space-y-6">
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onPrevious={navigatePrevious}
          onNext={navigateNext}
          onToday={goToToday}
        />

        {/* Calendar Legend */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Confirmed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Pending Payment</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Cancelled</span>
          </div>
        </div>

        {/* Calendar Views */}
        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            bookings={events}
            onBookingClick={handleBookingClick}
          />
        )}
        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            bookings={events}
            onBookingClick={handleBookingClick}
          />
        )}
        {view === "day" && (
          <DayView
            currentDate={currentDate}
            bookings={events}
            onBookingClick={handleBookingClick}
          />
        )}
      </div>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </AdminLayout>
  );
}
