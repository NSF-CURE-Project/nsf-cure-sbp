import type { Metadata } from "next";

import { ArrivalMapClient } from "./ArrivalMapClient";
import { isArrivalRouteId } from "./routes";

export const metadata: Metadata = {
  title: "Student Arrival Maps",
  description:
    "Unlisted driving, parking, and walking directions for NSF CURE Summer Bridge Program participants.",
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

type ArrivalMapPageProps = {
  searchParams: Promise<{ route?: string | string[] }>;
};

export default async function ArrivalMapPage({
  searchParams,
}: ArrivalMapPageProps) {
  const params = await searchParams;
  const requestedRoute = Array.isArray(params.route)
    ? params.route[0]
    : params.route;
  const initialRouteId = isArrivalRouteId(requestedRoute)
    ? requestedRoute
    : "sr57";

  return <ArrivalMapClient initialRouteId={initialRouteId} />;
}
