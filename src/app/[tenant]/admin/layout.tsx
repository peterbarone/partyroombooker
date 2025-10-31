import "./admin.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Party Room Booker",
  description: "Manage your bookings, rooms, and business settings",
};

export default function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-area admin-theme">
      <div className="admin-container">
        {children}
      </div>
    </div>
  );
}
