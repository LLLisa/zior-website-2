import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const routes = [
  { path: "/about", label: "About Us" },
  { path: "/for-the-newcomer", label: "For the Newcomer" },
  { path: "/calendar", label: "Calendar" },
  { path: "/jft", label: "Just For Today" },
  { path: "/service-at-zior", label: "Service at ZIOR" },
  { path: "/helpful-links", label: "Helpful Links" },
  { path: "/seventh-tradition", label: "7th Tradition" },
];

export function NavBar() {
  return (
    <nav className="w-full">
      <ul className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-1 px-2 pb-2">
        {routes.map((route) => (
          <li key={route.path}>
            <NavLink
              to={route.path}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-primary-foreground",
                  isActive && "bg-white/15 text-primary-foreground",
                )
              }
            >
              {route.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
