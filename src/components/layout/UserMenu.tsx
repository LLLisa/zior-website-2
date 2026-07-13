import { Link, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Settings, Users, UserCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // This is the site's only account entry point; it lives on the "Service at
  // ZIOR" page. Signed-out visitors get the sign-in button here.
  if (!user) {
    return (
      <Button asChild size="lg">
        <Link to="/login">
          <LogIn /> Sign in
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="lg">
          <UserCircle /> Account management
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="max-w-[16rem] truncate font-normal">
          {user.email}
          {user.isAdmin && (
            <span className="ml-1 text-xs font-semibold text-primary">(admin)</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/admin/users">
            <Users /> Manage users
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/settings">
            <Settings /> Site settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await logout();
            navigate("/");
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
