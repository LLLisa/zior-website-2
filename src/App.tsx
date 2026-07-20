import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RequireAdmin } from "@/components/RequireAdmin";
import { Home } from "@/pages/Home";
import { CmsPage } from "@/pages/CmsPage";
import { Jft } from "@/pages/Jft";
import { Calendar } from "@/pages/Calendar";
import { ServiceAtZior } from "@/pages/ServiceAtZior";
import { SeventhTradition } from "@/pages/SeventhTradition";
import { SlideDeckPage } from "@/pages/SlideDeckPage";
import { ScriptPage } from "@/pages/ScriptPage";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { UsersPage } from "@/pages/admin/UsersPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";

// Dynamic material routes read the slug from the URL; the fixed legacy routes
// below still work for older bookmarks.
function ScriptRoute() {
  const { slug } = useParams();
  return <ScriptPage slug={slug!} />;
}

function DeckRoute() {
  const { slug } = useParams();
  return <SlideDeckPage slug={slug!} />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/about" element={<CmsPage slug="about" />} />
        <Route path="/jft" element={<Jft />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route
          path="/for-the-newcomer"
          element={<CmsPage slug="for-the-newcomer" />}
        />
        <Route
          path="/helpful-links"
          element={<CmsPage slug="helpful-links" />}
        />
        <Route path="/service-at-zior" element={<ServiceAtZior />} />
        <Route path="/seventh-tradition" element={<SeventhTradition />} />
        <Route path="/scripts/:slug" element={<ScriptRoute />} />
        <Route path="/decks/:slug" element={<DeckRoute />} />
        <Route
          path="/slide-deck-daily"
          element={<SlideDeckPage slug="daily" />}
        />
        <Route
          path="/slide-deck-anniversary"
          element={<SlideDeckPage slug="anniversary" />}
        />
        <Route path="/daily-script" element={<ScriptPage slug="daily" />} />
        <Route
          path="/anniversary-script"
          element={<ScriptPage slug="anniversary" />}
        />
        <Route path="/login" element={<Login />} />

        <Route element={<RequireAdmin />}>
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
