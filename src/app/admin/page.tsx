"use client";

import { useState } from "react";
import Link from "next/link";

interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  organization: string | null;
  role: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  how_heard: string | null;
  payment_method: string;
  offer_code: string | null;
  amount_paid: number;
  download_count: number;
  created_at: string;
}

interface OfferCode {
  id: number;
  code: string;
  description: string;
  discount_percent: number;
  max_uses: number | null;
  current_uses: number;
  is_active: number;
}

interface Stats {
  total_customers: number;
  total_revenue: number;
  offer_code_count: number;
  paid_count: number;
  total_downloads: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [offerCodes, setOfferCodes] = useState<OfferCode[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"customers" | "codes">(
    "customers"
  );

  // New code form
  const [newCode, setNewCode] = useState({
    code: "",
    description: "",
    discountPercent: 100,
    maxUses: "",
  });
  const [uploading, setUploading] = useState(false);

  const fetchData = async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        headers: { "x-admin-password": pw },
      });
      if (res.status === 401) {
        setError("Invalid password.");
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCustomers(data.customers || []);
      setOfferCodes(data.offerCodes || []);
      setStats(data.stats || { total_customers: 0, total_revenue: 0, offer_code_count: 0, paid_count: 0, total_downloads: 0 });
      setAuthenticated(true);
      if (data.needsSetup) {
        alert("Database tables not found. Click 'Setup DB' to initialize.");
      }
    } catch {
      setError("Failed to load data.");
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchData(password);
  };

  const handleSetupDb = async () => {
    if (!confirm("This will create the database tables and seed default offer codes. Continue?")) return;
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "x-admin-password": password },
      });
      const data = await res.json();
      if (res.ok) {
        alert("Database initialized! " + data.message);
        await fetchData(password);
      } else {
        alert("Setup failed: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Setup request failed. Check your DATABASE_URL.");
    }
  };

  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) {
      alert("Please select a PDF file.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Upload failed. Make sure BLOB_READ_WRITE_TOKEN is set.");
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          ...newCode,
          maxUses: newCode.maxUses ? parseInt(newCode.maxUses) : null,
        }),
      });

      if (res.ok) {
        setNewCode({ code: "", description: "", discountPercent: 100, maxUses: "" });
        await fetchData(password);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create code");
      }
    } catch {
      alert("Failed to create code");
    }
  };

  const exportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Organization",
      "Role",
      "City",
      "State",
      "Country",
      "Phone",
      "How Heard",
      "Payment",
      "Offer Code",
      "Amount Paid",
      "Downloads",
      "Date",
    ];
    const rows = customers.map((c) => [
      `${c.first_name} ${c.last_name}`,
      c.email,
      c.organization || "",
      c.role || "",
      c.city || "",
      c.state || "",
      c.country || "",
      c.phone || "",
      c.how_heard || "",
      c.payment_method,
      c.offer_code || "",
      c.amount_paid.toFixed(2),
      c.download_count,
      c.created_at,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `modern-brokerage-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-navy mb-6 text-center">
            Admin Access
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-light text-navy font-bold py-3 rounded transition-colors"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>
          </form>
          <Link
            href="/"
            className="block text-center text-sm text-gray-400 mt-4 hover:text-gray-600"
          >
            &larr; Back to site
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy text-white py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <h1 className="font-bold text-lg">
            The Modern Brokerage &mdash; Admin
          </h1>
          <Link href="/" className="text-gold hover:text-gold-light text-sm">
            View Site &rarr;
          </Link>
        </div>
      </header>

      <div className="h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-3xl font-bold text-navy">
                {stats.total_customers}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ${Number(stats.total_revenue || 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Offer Code Uses</p>
              <p className="text-3xl font-bold text-gold-dark">
                {stats.offer_code_count}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Total Downloads</p>
              <p className="text-3xl font-bold text-navy">
                {stats.total_downloads}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("customers")}
            className={`py-2 px-4 rounded font-medium ${
              activeTab === "customers"
                ? "bg-navy text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab("codes")}
            className={`py-2 px-4 rounded font-medium ${
              activeTab === "codes"
                ? "bg-navy text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Offer Codes ({offerCodes.length})
          </button>
          <button
            onClick={exportCSV}
            className="ml-auto py-2 px-4 rounded font-medium bg-green-600 text-white hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => fetchData(password)}
            className="py-2 px-4 rounded font-medium bg-gray-200 text-gray-600 hover:bg-gray-300"
          >
            Refresh
          </button>
          <button
            onClick={handleSetupDb}
            className="py-2 px-4 rounded font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            Setup DB
          </button>
          <label className="py-2 px-4 rounded font-medium bg-purple-600 text-white hover:bg-purple-700 cursor-pointer">
            {uploading ? "Uploading..." : "Upload PDF"}
            <input
              type="file"
              accept=".pdf"
              onChange={handleUploadPdf}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Customers Table */}
        {activeTab === "customers" && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white text-left">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">How Heard</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Downloads</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No customers yet.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium">
                        {c.first_name} {c.last_name}
                      </td>
                      <td className="px-4 py-3">{c.email}</td>
                      <td className="px-4 py-3">{c.organization || "—"}</td>
                      <td className="px-4 py-3">{c.role || "—"}</td>
                      <td className="px-4 py-3">
                        {[c.city, c.state, c.country]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3">{c.how_heard || "—"}</td>
                      <td className="px-4 py-3">
                        {c.offer_code ? (
                          <span className="bg-gold/20 text-gold-dark px-2 py-0.5 rounded text-xs font-medium">
                            {c.offer_code}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        ${Number(c.amount_paid || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">{c.download_count}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Offer Codes Tab */}
        {activeTab === "codes" && (
          <div>
            {/* Create new code */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-semibold text-navy mb-4">
                Create New Offer Code
              </h3>
              <form
                onSubmit={handleCreateCode}
                className="grid sm:grid-cols-4 gap-4 items-end"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Code
                  </label>
                  <input
                    type="text"
                    value={newCode.code}
                    onChange={(e) =>
                      setNewCode({
                        ...newCode,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. SPRING2026"
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newCode.description}
                    onChange={(e) =>
                      setNewCode({ ...newCode, description: e.target.value })
                    }
                    placeholder="e.g. Spring semester"
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Max Uses (blank = unlimited)
                  </label>
                  <input
                    type="number"
                    value={newCode.maxUses}
                    onChange={(e) =>
                      setNewCode({ ...newCode, maxUses: e.target.value })
                    }
                    placeholder="Unlimited"
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gold hover:bg-gold-light text-navy font-bold py-2 px-4 rounded text-sm"
                >
                  Create Code
                </button>
              </form>
            </div>

            {/* Codes table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy text-white text-left">
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Discount</th>
                    <th className="px-4 py-3">Uses</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {offerCodes.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-mono font-bold">
                        {c.code}
                      </td>
                      <td className="px-4 py-3">{c.description}</td>
                      <td className="px-4 py-3">{c.discount_percent}%</td>
                      <td className="px-4 py-3">
                        {c.current_uses}
                        {c.max_uses ? ` / ${c.max_uses}` : " / ∞"}
                      </td>
                      <td className="px-4 py-3">
                        {c.is_active ? (
                          <span className="text-green-600 font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="text-red-500 font-medium">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
