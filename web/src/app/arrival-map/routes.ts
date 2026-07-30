export type ArrivalRouteId = "i10" | "sr57" | "walk";

export type ArrivalRouteStep = {
  title: string;
  description: string;
};

export type ArrivalRoute = {
  id: ArrivalRouteId;
  mode: "drive" | "walk";
  tabLabel: string;
  mobileTabLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  duration: string;
  distance: string;
  startLabel: string;
  endLabel: string;
  mapUrl: string;
  mapTitle: string;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
  directionsTitle: string;
  steps: ArrivalRouteStep[];
  landmarks: string[];
  destinationNumber: "106" | "163";
  destinationTitle: string;
  destinationSubtitle: string;
};

// Parking portal destination and official CPP powered-door entrance pins.
const PARKING_COORDINATES = "34.060554%2C-117.816389";
const BUILDING_163_COORDINATES = "34.061321%2C-117.820030";
const I10_ENTRY_COORDINATES = "34.0627957%2C-117.8118201";
const SR57_ENTRY_COORDINATES = "34.047829%2C-117.810358";

const parkingFromCurrentLocation =
  `https://www.google.com/maps/dir/?api=1&destination=${PARKING_COORDINATES}&travelmode=driving&dir_action=navigate`;
const buildingFromCurrentLocation =
  `https://www.google.com/maps/dir/?api=1&destination=${BUILDING_163_COORDINATES}&travelmode=walking&dir_action=navigate`;

export const PARKING_REGISTRATION_URL =
  "https://www.offstreet.io/events/UWJ8K7KQ";
export const CPP_PARKING_SERVICES_URL = "https://www.cpp.edu/parking/";
export const ROUTES_VERIFIED_LABEL = "July 30, 2026";

export const ARRIVAL_ROUTES: Record<ArrivalRouteId, ArrivalRoute> = {
  i10: {
    id: "i10",
    mode: "drive",
    tabLabel: "From I-10",
    mobileTabLabel: "I-10",
    eyebrow: "Driving route",
    title: "From I-10 via Kellogg Drive",
    description:
      "Use the Kellogg Drive exit from I-10, then follow the signed campus approach to Parking Structure 1.",
    duration: "About 5 min on campus",
    distance: "Campus entrance to parking",
    startLabel: "Kellogg Drive entrance · near Rose Float Lab",
    endLabel: "Parking Structure 1 · Building 106",
    mapUrl:
      `https://www.google.com/maps?saddr=${I10_ENTRY_COORDINATES}&daddr=${PARKING_COORDINATES}&dirflg=d&output=embed&hl=en`,
    mapTitle: "I-10 campus entrance to Parking Structure 1 map",
    primaryLabel: "Navigate to parking",
    primaryUrl: parkingFromCurrentLocation,
    secondaryLabel: "Preview campus approach",
    secondaryUrl:
      `https://www.google.com/maps/dir/?api=1&origin=${I10_ENTRY_COORDINATES}&destination=${PARKING_COORDINATES}&travelmode=driving`,
    directionsTitle: "Campus directions",
    steps: [
      {
        title: "Continue on East Campus Drive",
        description:
          "Follow the perimeter road northeast from the Kellogg Drive campus entrance.",
      },
      {
        title: "Turn right: South Campus Drive",
        description: "Continue around the east and south edge of campus.",
      },
      {
        title: "Turn right: Kellogg Drive",
        description: "Stay on Kellogg Drive when the road bends right.",
      },
      {
        title: "Turn left: South University Drive",
        description: "Use the signed campus road toward the F-series lots.",
      },
      {
        title: "Turn left: Magnolia Lane",
        description: "The entrance to Parking Structure 1 is on the left.",
      },
    ],
    landmarks: [
      "Campus welcome marquee",
      "South Campus Drive",
      "Red Gum Lane",
      "Magnolia Lane",
    ],
    destinationNumber: "106",
    destinationTitle: "Parking Structure 1",
    destinationSubtitle: "Magnolia Lane entrance",
  },
  sr57: {
    id: "sr57",
    mode: "drive",
    tabLabel: "From SR-57",
    mobileTabLabel: "SR-57",
    eyebrow: "Driving route",
    title: "From SR-57 via Temple Avenue",
    description:
      "Use the Temple Avenue exit from either direction on SR-57, then follow the campus approach to Parking Structure 1.",
    duration: "About 5 min on campus",
    distance: "Campus entrance to parking",
    startLabel: "Temple Ave & Pomona Blvd",
    endLabel: "Parking Structure 1 · Building 106",
    mapUrl:
      `https://www.google.com/maps?saddr=${SR57_ENTRY_COORDINATES}&daddr=${PARKING_COORDINATES}&dirflg=d&output=embed&hl=en`,
    mapTitle: "SR-57 Temple Avenue approach to Parking Structure 1 map",
    primaryLabel: "Navigate to parking",
    primaryUrl: parkingFromCurrentLocation,
    secondaryLabel: "Preview campus approach",
    secondaryUrl:
      `https://www.google.com/maps/dir/?api=1&origin=${SR57_ENTRY_COORDINATES}&destination=${PARKING_COORDINATES}&travelmode=driving`,
    directionsTitle: "Campus directions",
    steps: [
      {
        title: "Continue west: Temple Avenue",
        description:
          "Turn left from SR-57 North or right from SR-57 South.",
      },
      {
        title: "Turn right: South Campus Drive",
        description:
          "The CPP campus and welcome marquee will be on your right.",
      },
      {
        title: "Turn left: Kellogg Drive",
        description:
          "Use the second lane from the left at the intersection.",
      },
      {
        title: "Stay right on Kellogg Drive",
        description: "Continue past the Red Gum Lane intersection.",
      },
      {
        title: "Left: South University, then Magnolia",
        description: "Turn left again into Parking Structure 1.",
      },
    ],
    landmarks: [
      "Temple Avenue exit",
      "Campus welcome marquee",
      "Kellogg Field",
      "Red Gum Lane",
    ],
    destinationNumber: "106",
    destinationTitle: "Parking Structure 1",
    destinationSubtitle: "Magnolia Lane entrance",
  },
  walk: {
    id: "walk",
    mode: "walk",
    tabLabel: "Walk to Building 163",
    mobileTabLabel: "Walk",
    eyebrow: "Walking route",
    title: "Parking Structure 1 to Building 163",
    description:
      "A mostly flat walk from the parking structure to the College of Business Administration classrooms.",
    duration: "About 8–10 min",
    distance: "Approx. 0.3–0.4 mi",
    startLabel: "Parking Structure 1 · Building 106",
    endLabel: "Building 163 · CBA classrooms",
    mapUrl:
      `https://www.google.com/maps?saddr=${PARKING_COORDINATES}&daddr=${BUILDING_163_COORDINATES}&dirflg=w&output=embed&hl=en`,
    mapTitle: "Parking Structure 1 to Building 163 walking map",
    primaryLabel: "Open walking route",
    primaryUrl:
      `https://www.google.com/maps/dir/?api=1&origin=${PARKING_COORDINATES}&destination=${BUILDING_163_COORDINATES}&travelmode=walking`,
    secondaryLabel: "Navigate from my location",
    secondaryUrl: buildingFromCurrentLocation,
    directionsTitle: "Walking directions",
    steps: [
      {
        title: "Exit toward Oak Lane",
        description:
          "Use the pedestrian path along the south side of Structure 1.",
      },
      {
        title: "Follow Oak Lane west",
        description: "Continue around the structure toward Red Gum Lane.",
      },
      {
        title: "Turn right: Red Gum Lane",
        description: "Walk north using the marked pedestrian route.",
      },
      {
        title: "Turn left: South University Drive",
        description:
          "Follow the paved walkway west toward the CBA complex.",
      },
      {
        title: "Look for Building 163",
        description: "The classroom building is beside the Rose Garden.",
      },
    ],
    landmarks: [
      "Voorhis Alumni Park",
      "Aratani Japanese Garden",
      "Rose Garden",
      "CBA complex",
    ],
    destinationNumber: "163",
    destinationTitle: "Building 163",
    destinationSubtitle: "CBA classroom building",
  },
};

export const isArrivalRouteId = (
  value: string | undefined
): value is ArrivalRouteId => value === "i10" || value === "sr57" || value === "walk";
