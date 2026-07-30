import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Arrival Map",
  description:
    "Private-by-link driving and walking directions for NSF CURE Summer Bridge Program participants.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

const arrivalMapUrl =
  "https://cpp-student-arrival-maps.ajokonkwo.chatgpt.site";

export default function ArrivalMapPage() {
  return (
    <main className="min-h-screen bg-[#f5f3ea] text-slate-950">
      <header className="border-b-4 border-[#ffb81c] bg-[#005030] px-4 py-4 text-white shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffcf63]">
              NSF CURE Summer Bridge Program
            </p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">
              Student Arrival Map
            </h1>
          </div>
          <a
            href={arrivalMapUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-md bg-[#ffb81c] px-4 py-2 text-sm font-bold text-[#17352b] transition hover:bg-[#ffd36d] focus-visible:outline-white"
          >
            Open full screen
          </a>
        </div>
      </header>

      <section
        className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-5"
        aria-label="Interactive CPP arrival map"
      >
        <div className="mb-3 rounded-md border border-[#d9d2bd] bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          Choose the route for your freeway exit, or use the walking directions
          from Parking Structure 1 to Building 163. For turn-by-turn navigation,
          use the Google Maps button inside each route.
        </div>

        <div className="overflow-hidden rounded-lg border border-[#c9c1aa] bg-white shadow-lg">
          <iframe
            src={arrivalMapUrl}
            title="CPP student driving and walking arrival maps"
            className="h-[calc(100vh-12.5rem)] min-h-[620px] w-full"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="geolocation"
          />
        </div>

        <noscript>
          <p className="mt-4 rounded-md bg-white p-4 text-center">
            JavaScript is required for the interactive map.{" "}
            <a
              href={arrivalMapUrl}
              className="font-semibold underline"
              target="_blank"
              rel="noreferrer"
            >
              Open the arrival map directly
            </a>
            .
          </p>
        </noscript>
      </section>
    </main>
  );
}
