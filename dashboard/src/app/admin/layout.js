import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";
import AdminTopBar from "./components/AdminTopBar";

export default async function AdminLayout({ children }) {
  // Check admin session — allow login page through
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session")?.value;
  const isLoginPage = true; // Layout wraps everything including login

  // If no session and not on login page, the individual pages handle auth
  // The login page (/admin) doesn't use sidebar/topbar

  // For the login page, render children directly (no sidebar)
  // We detect the login page by checking if there's no admin_session
  // and the page is the root /admin page
  if (!adminSession) {
    return <>{children}</>;
  }

  if (adminSession !== process.env.ADMIN_KEY) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC", fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <AdminSidebar />
      <div className="lg:pl-60">
        <AdminTopBar />
        <main className="p-6 max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
