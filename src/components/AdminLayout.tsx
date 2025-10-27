import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminLayoutProps {
  children: ReactNode;
  tenant: string;
}

const AdminSidebar = ({ tenant }: { tenant: string }) => {
  const router = useRouter();

  const menuItems = [
    {
      name: "Dashboard",
      href: `/${tenant}/admin`,
      icon: "📊",
      description: "Overview & Analytics",
    },
    {
      name: "Bookings",
      href: `/${tenant}/admin/bookings`,
      icon: "📅",
      description: "Manage Reservations",
    },
    {
      name: "Calendar",
      href: `/${tenant}/admin/calendar`,
      icon: "🗓️",
      description: "Schedule View",
    },
    {
      name: "Customers",
      href: `/${tenant}/admin/customers`,
      icon: "👥",
      description: "Customer Database",
    },
    {
      name: "Rooms",
      href: `/${tenant}/admin/rooms`,
      icon: "🏢",
      description: "Room Management",
    },
    {
      name: "Packages",
      href: `/${tenant}/admin/packages`,
      icon: "📦",
      description: "Party Packages",
    },
    {
      name: "Reports",
      href: `/${tenant}/admin/reports`,
      icon: "📈",
      description: "Financial Reports",
    },
    {
      name: "Availability",
      href: `/${tenant}/admin/slots`,
      icon: "⏰",
      description: "Slot Templates",
    },
    {
      name: "Mappings",
      href: `/${tenant}/admin/mappings`,
      icon: "🔗",
      description: "Package ↔ Room",
    },
    {
      name: "Payments",
      href: `/${tenant}/admin/payments`,
      icon: "💳",
      description: "Transactions",
    },
    {
      name: "Billing",
      href: `/${tenant}/admin/billing`,
      icon: "🧾",
      description: "Subscription",
    },
    {
      name: "Staff",
      href: `/${tenant}/admin/staff`,
      icon: "🧑‍💼",
      description: "Team Members",
    },
    {
      name: "Ads",
      href: `/${tenant}/admin/ads`,
      icon: "🪧",
      description: "Advertisements",
    },
    {
      name: "Blackouts",
      href: `/${tenant}/admin/blackouts`,
      icon: "⛔",
      description: "Closed Dates",
    },
    {
      name: "Waivers",
      href: `/${tenant}/admin/waivers`,
      icon: "✍️",
      description: "Signed Waivers",
    },
    {
      name: "Add-ons",
      href: `/${tenant}/admin/addons`,
      icon: "➕",
      description: "Extras Catalog",
    },
    {
      name: "Characters",
      href: `/${tenant}/admin/characters`,
      icon: "🧙",
      description: "Party Characters",
    },
    {
      name: "FAQs",
      href: `/${tenant}/admin/faqs`,
      icon: "❓",
      description: "Common Questions",
    },
    {
      name: "Settings",
      href: `/${tenant}/admin/settings`,
      icon: "⚙️",
      description: "Configuration",
    },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <Link
          href={`/${tenant}`}
          className="flex items-center space-x-3 hover:text-blue-400 transition-colors"
        >
          <span className="text-2xl">🎉</span>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-gray-400 text-sm capitalize">{tenant}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group"
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-gray-400 text-xs">
                    {item.description}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <Link
          href={`/${tenant}`}
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
        >
          <span className="text-xl">🏠</span>
          <span>Back to Site</span>
        </Link>
      </div>
    </div>
  );
};

const AdminHeader = ({ title, tenant }: { title: string; tenant: string }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function AdminLayout({ children, tenant }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar tenant={tenant} />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Dashboard" tenant={tenant} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
