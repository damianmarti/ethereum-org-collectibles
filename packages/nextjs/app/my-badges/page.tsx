"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

interface Badge {
  id: string;
  name?: string;
  description?: string;
  image?: string;
  category?: string;
  link?: string;
  year?: string;
}

export default function MyBadgesPage() {
  const { address, isConnected } = useAccount();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    fetch(`/api/stats/${address}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch badges");
        return res.json();
      })
      .then(data => setBadges(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [address]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100">
        <RainbowKitCustomConnectButton />
        <div className="mt-4 text-gray-600">Connect your wallet to see your badges.</div>
      </div>
    );
  }

  // Group badges by year
  const badgesByYear: Record<string, Badge[]> = {};
  for (const badge of badges) {
    const year = badge.year || "Unknown Year";
    if (!badgesByYear[year]) badgesByYear[year] = [];
    badgesByYear[year].push(badge);
  }
  const sortedYears = Object.keys(badgesByYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">My Badges</h1>
      {loading && <div className="text-center text-gray-500">Loading badges...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {!loading && !error && badges.length === 0 && (
        <div className="text-center text-gray-500">No badges found for this address.</div>
      )}
      {sortedYears.map(year => (
        <div key={year} className="mb-12">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4 text-center">{year}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {badgesByYear[year].map(badge => (
              <div
                key={badge.id}
                className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-200"
              >
                {badge.image && (
                  <Image
                    src={badge.image}
                    alt={badge.name || "Badge image"}
                    width={120}
                    height={120}
                    className="rounded-lg mb-3 object-contain bg-white border"
                  />
                )}
                <div className="font-semibold text-lg text-center mb-1">{badge.name || `Badge #${badge.id}`}</div>
                {badge.description && <div className="text-gray-600 text-sm text-center mb-2">{badge.description}</div>}
                <div className="flex flex-wrap gap-2 justify-center text-xs mb-2">
                  {badge.category && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{badge.category}</span>
                  )}
                </div>
                {badge.link && (
                  <a
                    href={badge.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs mt-2"
                  >
                    View Badge ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
