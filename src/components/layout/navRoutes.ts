export type NavRoute = { path: string; label: string };

/** Shared primary navigation, used by both the desktop bar and mobile menu. */
export const navRoutes: NavRoute[] = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About Us" },
  { path: "/for-the-newcomer", label: "For the Newcomer" },
  { path: "/calendar", label: "Calendar" },
  { path: "/jft", label: "Just For Today" },
  { path: "/service-at-zior", label: "Service at ZIOR" },
  { path: "/helpful-links", label: "Helpful Links" },
  { path: "/seventh-tradition", label: "7th Tradition" },
];
