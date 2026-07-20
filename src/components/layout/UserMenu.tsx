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

  const signOut = async () => {
    await logout();
    navigate("/");
  };

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

  // Non-admins can edit content but have nothing to manage, so their only
  // account action is signing out.
  if (!user.isAdmin) {
    return (
      <Button variant="secondary" size="lg" onClick={signOut}>
        <LogOut /> Sign out
      </Button>
    );
  }

  // Admins get user management and site settings.
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="lg">
          <UserCircle /> Site management
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="max-w-[16rem] truncate font-normal">
          {user.email}
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
        <DropdownMenuItem onClick={signOut}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
