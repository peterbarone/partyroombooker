import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Icon = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center justify-center w-5 h-5" aria-hidden>
    {children}
  </span>
);

const Icons = {
  Logo: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" fill="currentColor" />
    </svg>
  ),
  Dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  ),
  Calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  Users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M22 21v-2a3 3 0 0 0-3-3h-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="17" cy="8" r="3" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  ),
  Building: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M9 9h2M13 9h2M9 13h2M13 13h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  Box: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7l9 5 9-5-9-5-9 5Zm0 0v10l9 5 9-5V7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  ),
  Chart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M7 15l4-5 3 2 4-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  Clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  Link: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 13a5 5 0 0 1 0-7l1.5-1.5a5 5 0 0 1 7 7L17 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M14 11a5 5 0 0 1 0 7L12.5 19.5a5 5 0 0 1-7-7L7 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  CreditCard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  ),
  Receipt: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 3h10v18l-2-1-2 1-2-1-2 1-2-1V3Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9 7h6M9 11h6M9 15h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  UserCog: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  Megaphone: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 11l14-5v12l-14-5v-2Zm4 7v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  Ban: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M5 19L19 5" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  ),
  FileSignature: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 17s1-1 2-1 1 1 2 1 1-1 2-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  PlusSquare: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  Sparkles: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  ),
  Help: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1.5 1.1-1.5 2v.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="17" r=".9" fill="currentColor"/>
    </svg>
  ),
  Settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M19.4 15a7.97 7.97 0 0 0 .1-2 7.97 7.97 0 0 0-.1-2l2-1.5-2-3.5-2.4 1a8.1 8.1 0 0 0-3.4-2l-.4-2.6h-4l-.4 2.6a8.1 8.1 0 0 0-3.4 2l-2.4-1-2 3.5 2 1.5a7.97 7.97 0 0 0-.1 2 7.97 7.97 0 0 0 .1 2l-2 1.5 2 3.5 2.4-1a8.1 8.1 0 0 0 3.4 2l.4 2.6h4l.4-2.6a8.1 8.1 0 0 0 3.4-2l2.4 1 2-3.5-2-1.5Z" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  ),
  Bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  Plus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12"/>
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
};

interface AdminLayoutProps {
  children: ReactNode;
  tenant: string;
}

const AdminSidebar = ({ tenant }: { tenant: string }) => {
  const router = useRouter();

  const menuItems: { name: string; href: string; icon: ReactNode; description: string }[] = [
    { name: "Dashboard", href: `/${tenant}/admin`, icon: <Icon>{Icons.Chart}</Icon>, description: "Overview & Analytics" },
    { name: "Bookings", href: `/${tenant}/admin/bookings`, icon: <Icon>{Icons.Calendar}</Icon>, description: "Manage Reservations" },
    { name: "Calendar", href: `/${tenant}/admin/calendar`, icon: <Icon>{Icons.Calendar}</Icon>, description: "Schedule View" },
    { name: "Customers", href: `/${tenant}/admin/customers`, icon: <Icon>{Icons.Users}</Icon>, description: "Customer Database" },
    { name: "Rooms", href: `/${tenant}/admin/rooms`, icon: <Icon>{Icons.Building}</Icon>, description: "Room Management" },
    { name: "Packages", href: `/${tenant}/admin/packages`, icon: <Icon>{Icons.Box}</Icon>, description: "Party Packages" },
    { name: "Reports", href: `/${tenant}/admin/reports`, icon: <Icon>{Icons.Dashboard}</Icon>, description: "Financial Reports" },
    { name: "Availability", href: `/${tenant}/admin/slots`, icon: <Icon>{Icons.Clock}</Icon>, description: "Slot Templates" },
    { name: "Mappings", href: `/${tenant}/admin/mappings`, icon: <Icon>{Icons.Link}</Icon>, description: "Package ↔ Room" },
    { name: "Payments", href: `/${tenant}/admin/payments`, icon: <Icon>{Icons.CreditCard}</Icon>, description: "Transactions" },
    { name: "Billing", href: `/${tenant}/admin/billing`, icon: <Icon>{Icons.Receipt}</Icon>, description: "Subscription" },
    { name: "Staff", href: `/${tenant}/admin/staff`, icon: <Icon>{Icons.UserCog}</Icon>, description: "Team Members" },
    { name: "Ads", href: `/${tenant}/admin/ads`, icon: <Icon>{Icons.Megaphone}</Icon>, description: "Advertisements" },
    { name: "Blackouts", href: `/${tenant}/admin/blackouts`, icon: <Icon>{Icons.Ban}</Icon>, description: "Closed Dates" },
    { name: "Waivers", href: `/${tenant}/admin/waivers`, icon: <Icon>{Icons.FileSignature}</Icon>, description: "Signed Waivers" },
    { name: "Add-ons", href: `/${tenant}/admin/addons`, icon: <Icon>{Icons.PlusSquare}</Icon>, description: "Extras Catalog" },
    { name: "Characters", href: `/${tenant}/admin/characters`, icon: <Icon>{Icons.Sparkles}</Icon>, description: "Party Characters" },
    { name: "FAQs", href: `/${tenant}/admin/faqs`, icon: <Icon>{Icons.Help}</Icon>, description: "Common Questions" },
    { name: "Settings", href: `/${tenant}/admin/settings`, icon: <Icon>{Icons.Settings}</Icon>, description: "Configuration" },
  ];

  return (
    <div className="admin-sidebar bg-white w-64 h-screen flex flex-col border-r" style={{ borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link
          href={`/${tenant}`}
          className="flex items-center space-x-3 transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          <span className="text-2xl" style={{ color: 'var(--accent)' }}>
            <Icon>{Icons.Logo}</Icon>
          </span>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Panel</h1>
            <p className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{tenant}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="admin-sidebar-link flex items-center space-x-3 p-3 rounded-lg transition-colors group"
              >
                <span className="text-xl" style={{ color: 'var(--text-secondary)' }}>{item.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {item.description}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <Link
          href={`/${tenant}`}
          className="flex items-center space-x-3 p-3 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span className="text-xl">🏠</span>
          <span className="text-sm">Back to Site</span>
        </Link>
      </div>
    </div>
  );
};

const AdminHeader = ({ title, tenant }: { title: string; tenant: string }) => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="admin-header bg-white border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="px-6 py-3">
        <div className="admin-topbar flex items-center justify-between gap-4">
          {/* Left: Title + meta */}
          <div className="min-w-0">
            <div className="flex items-baseline gap-3">
              <h1 className="admin-header-title" style={{ color: 'var(--text-primary)' }}>{title}</h1>
              <span className="page-meta hidden md:inline" aria-label="Current date">{today}</span>
            </div>
          </div>

          {/* Right: Search, hint, quick actions, avatar */}
          <div className="flex items-center gap-2 md:gap-3">
            <label className="sr-only" htmlFor="admin-search">Search</label>
            <input
              id="admin-search"
              className="admin-search"
              placeholder="Search"
              type="search"
              inputMode="search"
            />
            <button className="admin-icon-btn" aria-label="Notifications" title="Notifications"><Icon>{Icons.Bell}</Icon></button>
            <button className="admin-icon-btn" aria-label="Help" title="Help"><Icon>{Icons.Help}</Icon></button>
            <button className="admin-icon-btn" aria-label="Settings" title="Settings"><Icon>{Icons.Settings}</Icon></button>
            <button className="admin-icon-btn admin-icon-btn--primary owner-action" aria-label="Add company" title="Add company"><Icon>{Icons.Plus}</Icon></button>
            <div className="admin-avatar" title={tenant} aria-label="Account">A</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function AdminLayout({ children, tenant }: AdminLayoutProps) {
  return (
    <div className="flex h-screen" style={{ background: 'var(--bg-canvas)' }}>
      <AdminSidebar tenant={tenant} />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Dashboard" tenant={tenant} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
