import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navRoutes } from "./navRoutes";

/** Desktop navigation. Hidden on small screens, where MobileNav takes over. */
export function NavBar() {
  return (
    <nav className="hidden border-t border-white/10 md:block">
      <ul className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-1 px-4 py-2">
        {navRoutes.map((route) => (
          <li key={route.path}>
            <NavLink
              to={route.path}
              end
              className={({ isActive }) =>
                cn(
                  "block rounded-full px-3.5 py-1.5 text-sm font-medium text-primary-foreground/75 transition-colors hover:bg-white/10 hover:text-primary-foreground",
                  isActive && "bg-white/20 text-primary-foreground shadow-sm",
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
