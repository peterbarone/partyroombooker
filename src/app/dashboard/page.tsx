"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, getUserTenants } from "@/lib/auth";

interface UserTenant {
  id: string;
  role: string;
  permissions: string[];
  tenant: {
    id: string;
    slug: string;
    name: string;
    active: boolean;
    subscription_status: string | null;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tenants, setTenants] = useState<UserTenant[]>([]);

  useEffect(() => {
    const load = async () => {
      const currentUser = await getUser();
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      setUser(currentUser);
      const userTenants = await getUserTenants();
      setTenants(userTenants as any as UserTenant[]);
      setLoading(false);
    };

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.user_metadata?.full_name || user?.email}!
              </h1>
              <p className="text-gray-600">
                Manage your party room booking platforms
              </p>
            </div>
            <a
              href="/setup/company"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Add New Company
            </a>
          </div>
        </div>

        {/* Companies Grid */}
        {tenants.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Companies Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Get started by creating your first booking platform
            </p>
            <a
              href="/setup/company"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Company
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {tenant.tenant.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        /{tenant.tenant.slug}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tenant.role}
                    </span>
                  </div>

                  {tenant.tenant.subscription_status && (
                    <div className="mb-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tenant.tenant.subscription_status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tenant.tenant.subscription_status}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <a
                      href={`/${tenant.tenant.slug}/admin`}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
                    >
                      Open Admin
                    </a>
                    <a
                      href={`/${tenant.tenant.slug}`}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm font-medium"
                    >
                      View Site
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
