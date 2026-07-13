import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navRoutes } from "./navRoutes";

/** Hamburger menu for small screens: a panel that drops below the header. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the menu whenever we navigate to a new page.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-md text-primary-foreground transition-colors hover:bg-white/10"
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/20"
          />
          <nav className="absolute inset-x-0 top-full z-50 border-t border-white/10 bg-primary shadow-xl">
            <ul className="mx-auto flex max-w-5xl flex-col gap-1 px-3 py-3">
              {navRoutes.map((route) => (
                <li key={route.path}>
                  <NavLink
                    to={route.path}
                    end
                    className={({ isActive }) =>
                      cn(
                        "block rounded-md px-3 py-2.5 text-base font-medium text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-primary-foreground",
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
        </>
      )}
    </div>
  );
}
