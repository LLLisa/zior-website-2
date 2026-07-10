import { Link } from "react-router-dom";
import { useSettings } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { NavBar } from "./NavBar";
import { UserMenu } from "./UserMenu";

export function Header() {
  const { settings } = useSettings();
  const { user } = useAuth();
  const title = settings?.site_title || "Zoom In On Recovery";

  return (
    <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 pt-3">
        <Link to="/" className="text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </Link>
        <UserMenu />
      </div>
      {user && (
        <p className="px-4 pb-1 text-center text-xs text-primary-foreground/70">
          You're signed in — hover any page to edit its content.
        </p>
      )}
      <NavBar />
    </header>
  );
}
