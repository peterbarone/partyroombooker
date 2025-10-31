"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CompanySetupForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("US");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Retrieve Supabase session to authorize the API request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("You must be signed in to create a company.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/onboarding/create-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          companyName,
          streetAddress,
          address2,
          city,
          state,
          postalCode,
          country,
          phone,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create company");
      }

      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // If no payment required, go directly to admin
        router.push(`/${data.tenantSlug}/admin`);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="website-card p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Set Up Your Company
          </h2>
          <p className="text-gray-600">
            Tell us about your business so we can create your booking platform
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 website-form-container">
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              id="companyName"
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="The Family Fun Factory"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be used in your booking URL and communications
            </p>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Business Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="contact@yourcompany.com"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(716) 555-1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Address <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-4">
              <input
                id="streetAddress"
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Street address"
                autoComplete="address-line1"
              />
              <input
                id="address2"
                type="text"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Apt, suite, unit (optional)"
                autoComplete="address-line2"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  id="city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City"
                  autoComplete="address-level2"
                />
                <input
                  id="postalCode"
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Postal code"
                  autoComplete="postal-code"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  id="state"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  aria-label="State/Region"
                >
                  <option value="" disabled>
                    State/Region
                  </option>
                  <option value="NY">New York</option>
                  <option value="CA">California</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="IL">Illinois</option>
                  <option value="OH">Ohio</option>
                  <option value="MI">Michigan</option>
                  <option value="GA">Georgia</option>
                  <option value="NC">North Carolina</option>
                  <option value="NJ">New Jersey</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="MA">Massachusetts</option>
                  <option value="AZ">Arizona</option>
                  <option value="TN">Tennessee</option>
                  <option value="IN">Indiana</option>
                  <option value="MO">Missouri</option>
                  <option value="MD">Maryland</option>
                  <option value="WI">Wisconsin</option>
                  <option value="CO">Colorado</option>
                  <option value="MN">Minnesota</option>
                  <option value="SC">South Carolina</option>
                  <option value="AL">Alabama</option>
                  <option value="LA">Louisiana</option>
                  <option value="KY">Kentucky</option>
                  <option value="OR">Oregon</option>
                  <option value="OK">Oklahoma</option>
                  <option value="CT">Connecticut</option>
                  <option value="UT">Utah</option>
                  <option value="IA">Iowa</option>
                  <option value="NV">Nevada</option>
                  <option value="AR">Arkansas</option>
                  <option value="MS">Mississippi</option>
                  <option value="KS">Kansas</option>
                  <option value="NM">New Mexico</option>
                  <option value="NE">Nebraska</option>
                  <option value="WV">West Virginia</option>
                  <option value="ID">Idaho</option>
                  <option value="HI">Hawaii</option>
                  <option value="NH">New Hampshire</option>
                  <option value="ME">Maine</option>
                  <option value="RI">Rhode Island</option>
                  <option value="MT">Montana</option>
                  <option value="DE">Delaware</option>
                  <option value="SD">South Dakota</option>
                  <option value="ND">North Dakota</option>
                  <option value="AK">Alaska</option>
                  <option value="VT">Vermont</option>
                  <option value="WY">Wyoming</option>
                </select>
                <select
                  id="country"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  aria-label="Country"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-600 mt-0.5"
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
                <h3 className="text-sm font-medium text-blue-800">
                  What happens next?
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>We'll create your company account</li>
                    <li>You'll be redirected to secure payment setup</li>
                    <li>Once complete, access your admin dashboard</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
          >
            {loading ? "Creating Your Account..." : "Continue to Payment Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
