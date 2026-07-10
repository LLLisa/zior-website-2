import { useEffect, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { api, ApiError, type User } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [newAdmin, setNewAdmin] = useState(false);
  const [creating, setCreating] = useState(false);

  const iAmAdmin = !!me?.isAdmin;

  const load = async () => {
    try {
      setUsers(await api.listUsers());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const canManage = (u: User) => iAmAdmin || !u.isAdmin;

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const created = await api.createUser(newEmail.trim(), newAdmin);
      setUsers((list) => [...list, created].sort((a, b) => a.email.localeCompare(b.email)));
      setNewEmail("");
      setNewAdmin(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create user.");
    } finally {
      setCreating(false);
    }
  };

  const toggleAdmin = async (u: User, value: boolean) => {
    setError("");
    try {
      const updated = await api.setUserAdmin(u.id, value);
      setUsers((list) => list.map((x) => (x.id === u.id ? updated : x)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update user.");
    }
  };

  const remove = async (u: User) => {
    setError("");
    try {
      await api.deleteUser(u.id);
      setUsers((list) => list.filter((x) => x.id !== u.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete user.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">User management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {iAmAdmin
            ? "As an admin you can manage everyone, including other admins."
            : "You can manage non-admin users. Only admins can manage admins."}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form
        onSubmit={create}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4"
      >
        <div className="flex-1 space-y-2 min-w-[16rem]">
          <Label htmlFor="new-email">Add a user</Label>
          <Input
            id="new-email"
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="person@example.com"
          />
        </div>
        {iAmAdmin && (
          <label className="flex items-center gap-2 pb-2 text-sm">
            <Switch checked={newAdmin} onCheckedChange={setNewAdmin} />
            Admin
          </label>
        )}
        <Button type="submit" disabled={creating} className="mb-0.5">
          <UserPlus /> {creating ? "Adding…" : "Add user"}
        </Button>
      </form>

      {loading ? (
        <p className="text-muted-foreground">Loading users…</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    {u.email}
                    {me?.id === u.id && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.isAdmin ? (
                      <Badge>Admin</Badge>
                    ) : (
                      <Badge variant="secondary">Member</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {iAmAdmin && (
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          Admin
                          <Switch
                            checked={u.isAdmin}
                            onCheckedChange={(v) => toggleAdmin(u, v)}
                          />
                        </label>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${u.email}`}
                            disabled={!canManage(u)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {u.email}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              They will lose access immediately. This can't be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => remove(u)}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
