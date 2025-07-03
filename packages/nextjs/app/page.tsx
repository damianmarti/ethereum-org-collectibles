"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IdentificationIcon, TrophyIcon, UsersIcon } from "@heroicons/react/24/solid";

interface Stats {
  collectiblesCount: number;
  collectorsCount: number;
  uniqueAddressesCount: number;
}

const statsConfig = [
  {
    key: "collectiblesCount",
    label: "Unique Badges",
    icon: <TrophyIcon className="text-blue-500 w-10 h-10 mb-2" />,
    color: "from-blue-100 to-blue-300",
  },
  {
    key: "collectorsCount",
    label: "Minted",
    icon: <UsersIcon className="text-purple-500 w-10 h-10 mb-2" />,
    color: "from-purple-100 to-purple-300",
  },
  {
    key: "uniqueAddressesCount",
    label: "Collectors",
    icon: <IdentificationIcon className="text-green-500 w-10 h-10 mb-2" />,
    color: "from-green-100 to-green-300",
  },
];

const Home = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="px-5 flex flex-col items-center w-full">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">Ethereum.org Collectibles</span>
        </h1>
        <Image
          src="/ethereum.webp"
          alt="Ethereum Logo"
          width={600}
          height={600}
          className="rounded-2xl shadow-xl w-full max-w-2xl mt-2"
          priority
        />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl">
          {loading ? (
            <div className="col-span-3 text-center text-gray-500">Loading stats...</div>
          ) : stats ? (
            statsConfig.map(({ key, label, icon, color }) => (
              <div
                key={key}
                className={`bg-gradient-to-br ${color} rounded-2xl shadow-xl p-8 flex flex-col items-center border border-gray-200 hover:scale-105 transition-transform duration-200`}
              >
                {icon}
                <div className="text-4xl font-extrabold text-gray-900 mb-1 drop-shadow-sm">
                  {stats[key as keyof Stats]}
                </div>
                <div className="text-gray-700 text-base font-medium text-center">{label}</div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-red-500">Failed to load stats.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
