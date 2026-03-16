"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  role: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  howHeard: string;
  offerCode: string;
}

export default function PurchasePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-cream flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
        </main>
      }
    >
      <PurchaseForm />
    </Suspense>
  );
}

function PurchaseForm() {
  const searchParams = useSearchParams();
  const showCodeField = searchParams.get("code") === "true";

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    role: "",
    city: "",
    state: "",
    country: "US",
    phone: "",
    howHeard: "",
    offerCode: "",
  });

  const [codeValidation, setCodeValidation] = useState<{
    valid: boolean;
    message: string;
    discount: number;
  } | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [useOfferCode, setUseOfferCode] = useState(showCodeField);

  // Validate offer code
  useEffect(() => {
    if (!form.offerCode || form.offerCode.length < 3) {
      setCodeValidation(null);
      return;
    }

    const timer = setTimeout(async () => {
      setValidatingCode(true);
      try {
        const res = await fetch("/api/validate-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: form.offerCode }),
        });
        const data = await res.json();
        setCodeValidation(data);
      } catch {
        setCodeValidation({ valid: false, message: "Error validating code", discount: 0 });
      }
      setValidatingCode(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [form.offerCode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // If using offer code, process directly
      if (useOfferCode && codeValidation?.valid) {
        const res = await fetch("/api/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            paymentMethod: "offer_code",
          }),
        });
        const data = await res.json();

        if (data.success) {
          window.location.href = `/download/${data.downloadToken}`;
        } else {
          setError(data.error || "Something went wrong. Please try again.");
        }
      } else if (!useOfferCode) {
        // Stripe flow (stubbed)
        const res = await fetch("/api/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            paymentMethod: "stripe",
          }),
        });
        const data = await res.json();

        if (data.stripeUrl) {
          window.location.href = data.stripeUrl;
        } else if (data.success) {
          // Stub: go directly to download for now
          window.location.href = `/download/${data.downloadToken}`;
        } else {
          setError(data.error || "Something went wrong. Please try again.");
        }
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setSubmitting(false);
  };

  const effectivePrice =
    useOfferCode && codeValidation?.valid
      ? 55 * (1 - codeValidation.discount / 100)
      : 55;

  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-navy text-white py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/book-cover.png"
              alt="The Modern Brokerage"
              width={40}
              height={53}
              className="rounded-sm"
            />
            <span className="font-semibold">The Modern Brokerage</span>
          </Link>
          <span className="text-gold font-semibold text-lg">
            {effectivePrice === 0 ? "FREE" : `$${effectivePrice.toFixed(2)}`}
          </span>
        </div>
      </header>

      <div className="h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-navy mb-2">
          Get Your Copy
        </h1>
        <p className="text-gray-600 mb-8">
          Complete the form below to access the digital edition of The Modern
          Brokerage.
        </p>

        {/* Toggle: Pay vs Offer Code */}
        <div className="flex gap-2 mb-8">
          <button
            type="button"
            onClick={() => setUseOfferCode(false)}
            className={`py-2 px-4 rounded font-medium transition-colors ${
              !useOfferCode
                ? "bg-navy text-white"
                : "bg-cream-dark text-gray-600 hover:bg-gray-200"
            }`}
          >
            Pay $55.00
          </button>
          <button
            type="button"
            onClick={() => setUseOfferCode(true)}
            className={`py-2 px-4 rounded font-medium transition-colors ${
              useOfferCode
                ? "bg-navy text-white"
                : "bg-cream-dark text-gray-600 hover:bg-gray-200"
            }`}
          >
            Use Offer Code
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Offer Code */}
          {useOfferCode && (
            <div className="bg-white border-2 border-gold/30 rounded-lg p-5">
              <label className="block text-sm font-semibold text-navy mb-2">
                Offer Code
              </label>
              <input
                type="text"
                name="offerCode"
                value={form.offerCode}
                onChange={handleChange}
                placeholder="Enter your offer code"
                className="w-full border border-gray-300 rounded px-4 py-3 text-lg tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-gold"
                required={useOfferCode}
              />
              {validatingCode && (
                <p className="text-sm text-gray-500 mt-2">Validating...</p>
              )}
              {codeValidation && (
                <p
                  className={`text-sm mt-2 font-medium ${
                    codeValidation.valid ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {codeValidation.message}
                </p>
              )}
            </div>
          )}

          {/* Personal Information */}
          <fieldset className="bg-white rounded-lg p-6 shadow-sm">
            <legend className="text-lg font-semibold text-navy mb-4">
              Your Information
            </legend>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </fieldset>

          {/* Professional Information */}
          <fieldset className="bg-white rounded-lg p-6 shadow-sm">
            <legend className="text-lg font-semibold text-navy mb-4">
              Professional Information
            </legend>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization / Company
                </label>
                <input
                  type="text"
                  name="organization"
                  value={form.organization}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role / Title
                </label>
                <input
                  type="text"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="e.g. Broker, Agent, Student"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How did you hear about this book?
              </label>
              <select
                name="howHeard"
                value={form.howHeard}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="">Select one...</option>
                <option value="professor">Professor / Instructor</option>
                <option value="colleague">Colleague</option>
                <option value="conference">Conference / Event</option>
                <option value="social_media">Social Media</option>
                <option value="search">Web Search</option>
                <option value="ares">American Real Estate Society</option>
                <option value="other">Other</option>
              </select>
            </div>
          </fieldset>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={
              submitting ||
              (useOfferCode && !codeValidation?.valid)
            }
            className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-navy font-bold py-4 px-8 rounded transition-colors text-lg"
          >
            {submitting
              ? "Processing..."
              : useOfferCode
              ? effectivePrice === 0
                ? "Get Free Access"
                : `Pay $${effectivePrice.toFixed(2)}`
              : "Continue to Payment — $55.00"}
          </button>

          {!useOfferCode && (
            <p className="text-center text-sm text-gray-500">
              Payment processing will be available soon. Use an offer code for
              immediate access, or check back shortly.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
