import { Link } from "react-router-dom";
import { useSettings } from "@/lib/settings";
import { NavBar } from "./NavBar";
import { MobileNav } from "./MobileNav";

export function Header() {
  const { settings } = useSettings();
  const title = settings?.site_title || "Zoom In On Recovery";

  return (
    <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
        {/* Balances the mobile hamburger so the title stays centered. */}
        <div className="w-10 shrink-0 md:hidden" aria-hidden="true" />
        <Link
          to="/"
          className="flex-1 text-center text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {title}
        </Link>
        <MobileNav />
      </div>
      <NavBar />
    </header>
  );
}
