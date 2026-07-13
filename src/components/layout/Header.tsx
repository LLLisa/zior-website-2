import { Link } from "react-router-dom";
import { useSettings } from "@/lib/settings";
import { NavBar } from "./NavBar";
import { MobileNav } from "./MobileNav";

export function Header() {
  const { settings } = useSettings();
  const title = settings?.site_title || "Zoom In On Recovery";

  return (
    <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link
          to="/"
          className="brand-title text-xl font-bold tracking-tight sm:text-2xl"
        >
          {title}
        </Link>
        <MobileNav />
      </div>
      <NavBar />
    </header>
  );
}
