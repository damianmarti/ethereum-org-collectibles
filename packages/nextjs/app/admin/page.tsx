"use client";

import { useState } from "react";
import scaffoldConfig from "../../scaffold.config";
import { useAccount, useSignMessage } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

const categories = ["Github", "Translation", "Community", "Design", "Events / Calls"];

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [year, setYear] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { signMessageAsync } = useSignMessage();
  const [loading, setLoading] = useState(false);

  const isAdmin = address && scaffoldConfig.admins.map(a => a.toLowerCase()).includes(address.toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const message = `Add collectible: year=${year}, url=${url}, category=${category}`;
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/collectibles/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, url, category, address, signature }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResult(data);
      setYear("");
      setUrl("");
      setCategory("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <RainbowKitCustomConnectButton />
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500 bg-gradient-to-br from-gray-50 to-blue-50">
        Not authorized
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 py-10 px-2">
      <div className="w-full max-w-lg bg-white/90 shadow-xl rounded-2xl p-8 border border-gray-200">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Add New Badge</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Year</label>
            <input
              value={year}
              onChange={e => setYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              required
              placeholder="e.g. 2024"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Badge URL</label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              required
              placeholder="Paste the badge link here"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              required
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="btn w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !year || !url || !category}
          >
            {loading ? "Adding..." : "Add Badge"}
          </button>
        </form>
        {error && <div className="mt-6 text-red-600 text-center font-medium">Error: {error}</div>}
        {result && (
          <div className="mt-8 p-4 border rounded-lg bg-blue-50 flex flex-col items-center">
            <h2 className="font-bold mb-4 text-blue-700 text-xl">Badge Created</h2>
            {result.image && (
              <img
                src={result.image}
                alt={result.name || "Badge image"}
                className="w-32 h-32 rounded-xl shadow mb-4 object-contain bg-white border"
              />
            )}
            {result.name && <div className="text-lg font-semibold mb-2 text-center">{result.name}</div>}
            {result.description && <div className="text-gray-700 mb-2 text-center">{result.description}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mt-2 w-full max-w-md text-sm">
              {result.year && (
                <div>
                  <span className="font-medium text-gray-600">Year:</span> {result.year}
                </div>
              )}
              {result.category && (
                <div>
                  <span className="font-medium text-gray-600">Category:</span> {result.category}
                </div>
              )}
              {result.source && (
                <div>
                  <span className="font-medium text-gray-600">Source:</span> {result.source}
                </div>
              )}
              {result.fancy_id && (
                <div>
                  <span className="font-medium text-gray-600">Fancy ID:</span> {result.fancy_id}
                </div>
              )}
              {result.id && (
                <div>
                  <span className="font-medium text-gray-600">ID:</span> {result.id}
                </div>
              )}
              {result.poap_event_id && (
                <div>
                  <span className="font-medium text-gray-600">POAP Event ID:</span> {result.poap_event_id}
                </div>
              )}
              {result.start_time && (
                <div>
                  <span className="font-medium text-gray-600">Start:</span>{" "}
                  {new Date(result.start_time).toLocaleDateString()}
                </div>
              )}
              {result.end_time && (
                <div>
                  <span className="font-medium text-gray-600">End:</span>{" "}
                  {new Date(result.end_time).toLocaleDateString()}
                </div>
              )}
            </div>
            {result.link && (
              <a
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-blue-600 hover:underline text-sm font-medium"
              >
                View Badge Link ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
