"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  CarFront,
  Check,
  ExternalLink,
  Footprints,
  Mail,
  MapPin,
  Phone,
  Printer,
} from "lucide-react";

import styles from "./arrival-map.module.css";
import {
  ARRIVAL_ROUTES,
  CPP_PARKING_SERVICES_URL,
  PARKING_REGISTRATION_URL,
  ROUTES_VERIFIED_LABEL,
  type ArrivalRoute,
  type ArrivalRouteId,
} from "./routes";

const routeOrder: ArrivalRouteId[] = ["i10", "sr57", "walk"];

function RouteModeIcon({ route }: { route: ArrivalRoute }) {
  if (route.mode === "walk") {
    return <Footprints aria-hidden="true" />;
  }

  return <CarFront aria-hidden="true" />;
}

function ExternalAction({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      className={primary ? styles.primaryAction : styles.secondaryAction}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>{children}</span>
      {primary ? (
        <ArrowRight aria-hidden="true" />
      ) : (
        <ExternalLink aria-hidden="true" />
      )}
    </a>
  );
}

export function ArrivalMapClient({
  initialRouteId,
}: {
  initialRouteId: ArrivalRouteId;
}) {
  const [routeId, setRouteId] = useState(initialRouteId);
  const route = ARRIVAL_ROUTES[routeId];

  useEffect(() => {
    const restoreRouteFromUrl = () => {
      const requestedRoute = new URL(window.location.href).searchParams.get(
        "route"
      );
      setRouteId(
        requestedRoute === "i10" ||
          requestedRoute === "sr57" ||
          requestedRoute === "walk"
          ? requestedRoute
          : "sr57"
      );
    };

    window.addEventListener("popstate", restoreRouteFromUrl);
    return () => window.removeEventListener("popstate", restoreRouteFromUrl);
  }, []);

  const selectRoute = (nextRouteId: ArrivalRouteId) => {
    setRouteId(nextRouteId);

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("route", nextRouteId);
    window.history.pushState(
      null,
      "",
      `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
    );
  };

  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#arrival-routes">
        Skip to arrival routes
      </a>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brandLockup}>
            <div className={styles.brandMark} aria-hidden="true">
              SBP
            </div>
            <div>
              <p className={styles.programName}>
                NSF CURE Summer Bridge Program
              </p>
              <h1>CPP Student Arrival Maps</h1>
              <p className={styles.headerRoute}>
                Parking Structure 1 <span aria-hidden="true">→</span>{" "}
                Building 163
              </p>
            </div>
          </div>
          <div className={styles.campusLabel}>
            <strong>Cal Poly Pomona</strong>
            <span>Plan your drive, parking, and walk.</span>
          </div>
        </div>
      </header>

      <div className={styles.pageContent}>
        <section
          className={styles.preparationGrid}
          aria-labelledby="before-you-leave-title"
        >
          <div className={styles.preparationPanel}>
            <div className={styles.preparationIntro}>
              <div>
                <p className={styles.sectionLabel}>Before you leave</p>
                <h2 id="before-you-leave-title">
                  Register first, then save your route
                </h2>
                <p>
                  CPP requires valid parking authorization with no grace
                  period. Parking registration is valid all day on weekdays,
                  August 6–19, 2026. Register your license plate before
                  arrival—your plate is your permit.
                </p>
              </div>
              <div className={styles.preparationActions}>
                <a
                  className={styles.registrationAction}
                  href={PARKING_REGISTRATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Parking registration
                  <ArrowRight aria-hidden="true" />
                </a>
                <button
                  className={styles.printAction}
                  type="button"
                  onClick={() => window.print()}
                >
                  <Printer aria-hidden="true" />
                  Print directions
                </button>
              </div>
            </div>

            <ol className={styles.preparationSteps}>
              <li>
                <span>1</span>
                <div>
                  <strong>Register your vehicle</strong>
                  <p>Use the event link and save the confirmation.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Drive to Structure 1</strong>
                  <p>Enter from Magnolia Lane and follow event signs.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Walk to Building 163</strong>
                  <p>Allow about 8–10 minutes from the structure.</p>
                </div>
              </li>
            </ol>

            <p className={styles.parkingFinePrint}>
              Park only in locations permitted by your registration and posted
              signage. Check your itinerary for your arrival time and call
              Parking Services if the assigned area is full.
            </p>
          </div>

          <aside className={styles.destinationPanel} aria-label="Destination">
            <div className={styles.destinationNumber}>106</div>
            <div>
              <p className={styles.sectionLabel}>Your parking destination</p>
              <h2>Parking Structure 1</h2>
              <p>Building 106 · Magnolia Lane entrance</p>
            </div>
            <div className={styles.accessibilityNote}>
              <Accessibility aria-hidden="true" />
              <p>
                Accessible parking is available in Structure 1. A valid state
                placard or plate and event registration are required. Need a
                drop-off arrangement?{" "}
                <Link href="/contact-us">Contact program staff</Link>.
              </p>
            </div>
          </aside>
        </section>

        <section
          className={styles.routeSection}
          aria-labelledby="active-route-title"
        >
          <div
            className={styles.routeHeadingRow}
            id="arrival-routes"
            tabIndex={-1}
          >
            <div>
              <p className={styles.sectionLabel}>{route.eyebrow}</p>
              <h2 id="active-route-title">{route.title}</h2>
              <p className={styles.routeDescription}>{route.description}</p>
            </div>
            <div className={styles.durationCard}>
              <strong>{route.duration}</strong>
              <span>{route.distance}</span>
            </div>
          </div>

          <div
            className={styles.routeSelector}
            role="group"
            aria-label="Choose an arrival route"
          >
            {routeOrder.map((candidateId) => {
              const candidate = ARRIVAL_ROUTES[candidateId];
              const isSelected = candidateId === routeId;

              return (
                <button
                  className={`${styles.routeButton} ${
                    isSelected ? styles.routeButtonSelected : ""
                  }`}
                  key={candidateId}
                  type="button"
                  aria-label={candidate.tabLabel}
                  aria-pressed={isSelected}
                  aria-controls="arrival-route-panel"
                  onClick={() => selectRoute(candidateId)}
                >
                  <span className={styles.routeIcon}>
                    <RouteModeIcon route={candidate} />
                  </span>
                  <span className={styles.desktopTabLabel}>
                    {candidate.tabLabel}
                  </span>
                  <span className={styles.mobileTabLabel} aria-hidden="true">
                    {candidate.mobileTabLabel}
                  </span>
                </button>
              );
            })}
          </div>

          <p className={styles.srOnly} aria-live="polite" aria-atomic="true">
            {route.title} selected.
          </p>

          <div id="arrival-route-panel" className={styles.routePanel}>
            <div className={styles.endpoints}>
              <div>
                <span>A</span>
                <p>{route.startLabel}</p>
              </div>
              <div className={styles.endpointLine} aria-hidden="true" />
              <div>
                <span>B</span>
                <p>{route.endLabel}</p>
              </div>
            </div>

            <div className={styles.navigationActions}>
              <ExternalAction href={route.primaryUrl} primary>
                {route.primaryLabel}
              </ExternalAction>
              <ExternalAction href={route.secondaryUrl}>
                {route.secondaryLabel}
              </ExternalAction>
            </div>

            <div className={styles.mapToolbar}>
              <div>
                <MapPin aria-hidden="true" />
                <span>Live Google route</span>
              </div>
              <a href="#written-directions">Skip map to written directions</a>
            </div>

            <div className={styles.mapFrame}>
              <iframe
                key={route.id}
                src={route.mapUrl}
                title={route.mapTitle}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            <div className={styles.routeDetailsGrid}>
              <section
                className={styles.directionsPanel}
                id="written-directions"
                tabIndex={-1}
                aria-labelledby="written-directions-title"
              >
                <div className={styles.panelHeading}>
                  <div>
                    <p className={styles.sectionLabel}>Turn by turn</p>
                    <h3 id="written-directions-title">
                      {route.directionsTitle}
                    </h3>
                  </div>
                  <ExternalAction href={route.primaryUrl} primary>
                    Open in Google Maps
                  </ExternalAction>
                </div>

                <ol className={styles.directionsList}>
                  {route.steps.map((step, index) => (
                    <li key={step.title}>
                      <span>{index + 1}</span>
                      <div>
                        <strong>{step.title}</strong>
                        <p>{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <aside
                className={styles.landmarksPanel}
                aria-labelledby="landmarks-title"
              >
                <p className={styles.sectionLabel}>Look for</p>
                <h3 id="landmarks-title">Buildings &amp; landmarks</h3>
                <ul>
                  {route.landmarks.map((landmark) => (
                    <li key={landmark}>
                      <Check aria-hidden="true" />
                      <span>{landmark}</span>
                    </li>
                  ))}
                </ul>

                <div className={styles.routeDestination}>
                  <div>{route.destinationNumber}</div>
                  <div>
                    <p className={styles.sectionLabel}>Destination</p>
                    <strong>{route.destinationTitle}</strong>
                    <span>{route.destinationSubtitle}</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <footer className={styles.helpPanel}>
          <div>
            <p className={styles.sectionLabel}>Arrival help</p>
            <h2>Keep these contacts with your confirmation</h2>
            <p>
              Route details last verified {ROUTES_VERIFIED_LABEL}. Campus roads
              and pedestrian access can change; always follow posted signs.
            </p>
          </div>
          <div className={styles.contactLinks}>
            <a href="tel:+19098693061">
              <Phone aria-hidden="true" />
              Parking Services: (909) 869-3061
            </a>
            <a href="mailto:parking@cpp.edu">
              <Mail aria-hidden="true" />
              parking@cpp.edu
            </a>
            <a
              href={CPP_PARKING_SERVICES_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink aria-hidden="true" />
              Official CPP parking information
            </a>
          </div>
          <p className={styles.safetyNote}>
            Never read this page while driving. Start navigation before you
            leave and let a passenger handle route changes.
          </p>
        </footer>
      </div>
    </main>
  );
}
