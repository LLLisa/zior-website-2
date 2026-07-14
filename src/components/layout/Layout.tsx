import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout() {
  return (
    // App shell: header and footer are static rows; only <main> scrolls, so the
    // bars stay put instead of moving with the page scroll.
    <div className="flex h-dvh flex-col">
      <Header />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
