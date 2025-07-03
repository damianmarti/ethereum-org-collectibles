import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Badge {
  id: string;
  name?: string;
  description?: string;
  image?: string;
  category?: string;
  collectorsCount?: number;
  link?: string;
}

function groupByCategory(badges: Badge[]) {
  const grouped: Record<string, Badge[]> = {};
  for (const badge of badges) {
    const cat = badge.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(badge);
  }
  return grouped;
}

function getYearRange(start: number, end: number) {
  const years = [];
  for (let y = start; y <= end; y++) years.push(y);
  return years;
}

export default async function BadgesPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/collectibles/${year}`);
  if (!res.ok) return notFound();
  const badges: Badge[] = await res.json();
  const grouped = groupByCategory(badges);
  const categories = Object.keys(grouped);
  const years = getYearRange(2019, new Date().getFullYear());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 py-10 px-4">
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {years.map(y => (
          <Link
            key={y}
            href={`/badges/${y}`}
            className={`px-3 py-1 rounded font-medium border transition-colors ${y.toString() === year ? "bg-blue-700 text-white border-blue-700" : "bg-white text-blue-700 border-blue-200 hover:bg-blue-100"}`}
          >
            {y}
          </Link>
        ))}
      </div>
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">{year} Badges</h1>
      {categories.length === 0 && <div className="text-center text-gray-500">No badges found for {year}.</div>}
      {categories.map(category => (
        <div key={category} className="mb-12">
          <h2 className="text-xl font-semibold text-blue-800 mb-4 text-center">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {grouped[category].map(badge => (
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
                  {typeof badge.collectorsCount === "number" && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      Collectors: {badge.collectorsCount}
                    </span>
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
