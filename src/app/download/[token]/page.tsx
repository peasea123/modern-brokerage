"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";

interface DownloadInfo {
  customerName: string;
  email: string;
  downloadsRemaining: number;
  expiresAt: string;
  error?: string;
}

export default function DownloadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [info, setInfo] = useState<DownloadInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInfo() {
      try {
        const res = await fetch(`/api/download/${token}/info`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setInfo(data);
        }
      } catch {
        setError("Unable to load download information.");
      }
      setLoading(false);
    }
    fetchInfo();
  }, [token]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/download/${token}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Download failed.");
        setDownloading(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "The-Modern-Brokerage.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Refresh info to update remaining downloads
      const infoRes = await fetch(`/api/download/${token}/info`);
      const infoData = await infoRes.json();
      if (!infoData.error) {
        setInfo(infoData);
      }
    } catch {
      setError("Download failed. Please try again.");
    }
    setDownloading(false);
  };

  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-navy text-white py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-3">
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
        </div>
      </header>

      <div className="h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />

      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        {loading ? (
          <div className="py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4" />
            <p className="text-gray-500">Loading your download...</p>
          </div>
        ) : error ? (
          <div className="py-20">
            <div className="text-6xl mb-4">&#9888;&#65039;</div>
            <h1 className="text-2xl font-bold text-navy mb-4">
              Download Unavailable
            </h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              href="/"
              className="text-gold hover:text-gold-dark font-medium"
            >
              &larr; Return to homepage
            </Link>
          </div>
        ) : (
          info && (
            <>
              <div className="text-6xl mb-4">&#9989;</div>
              <h1 className="text-3xl font-bold text-navy mb-2">
                Thank You, {info.customerName}!
              </h1>
              <p className="text-gray-600 mb-8">
                Your copy of The Modern Brokerage is ready to download.
              </p>

              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <Image
                  src="/images/book-cover.png"
                  alt="The Modern Brokerage"
                  width={200}
                  height={267}
                  className="mx-auto mb-6 rounded shadow-lg"
                />

                <button
                  onClick={handleDownload}
                  disabled={downloading || info.downloadsRemaining <= 0}
                  className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-navy font-bold py-4 px-8 rounded transition-colors text-lg mb-4"
                >
                  {downloading ? "Downloading..." : "Download PDF"}
                </button>

                <p className="text-sm text-gray-500">
                  {info.downloadsRemaining} download
                  {info.downloadsRemaining !== 1 ? "s" : ""} remaining
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Link expires{" "}
                  {new Date(info.expiresAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="bg-navy/5 rounded-lg p-4 text-sm text-gray-600">
                <p>
                  A confirmation has been sent to{" "}
                  <strong>{info.email}</strong>. Save this page URL to
                  access your download again.
                </p>
              </div>
            </>
          )
        )}
      </div>
    </main>
  );
}
