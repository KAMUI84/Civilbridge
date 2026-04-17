import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, Menu, X, ChevronDown, LayoutDashboard, User, Settings, LogOut } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/authService";
import NotificationInbox from "./NotificationInbox";

const AUTH_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Marketplace", path: "/marketplace" },
  { name: "Plans",       path: "/plans" },
  { name: "Experts",     path: "/experts" },
  { name: "AI Workspace", path: "/intelligence" },
  { name: "Estimator",   path: "/estimator" },
];

function getInitials(user) {
  if (!user) return "?";
  const name = user.fullName || user.full_name || user.name || "";
  if (name.trim()) {
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return (user.email || "?")[0].toUpperCase();
}

function getFirstName(user) {
  if (!user) return "";
  const name = user.fullName || user.full_name || user.name || "";
  return name.split(" ")[0] || user.email?.split("@")[0] || "Account";
}

function getRoleLabel(role) {
  const labels = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    ENGINEER: "Engineer",
    ARCHITECT: "Architect",
    CONTRACTOR: "Contractor",
    CLIENT: "Client",
    HOME_BUILDER: "Home Builder",
  };
  return labels[role] || role || "Member";
}

export default function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, isAuthenticated, logout: storeLogout } = useAuthStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [loggingOut,     setLoggingOut]     = useState(false);

  const dropdownRef = useRef(null);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
    } catch { /* ignore network errors on logout */ }
    storeLogout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
    setLoggingOut(false);
  }, [storeLogout, navigate]);

  if (AUTH_ROUTES.has(location.pathname)) return null;

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const initials   = getInitials(user);
  const firstName  = getFirstName(user);
  const roleLabel  = getRoleLabel(user?.role);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-shadow duration-300 ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
        style={{ height: "72px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">

            {/* ── Logo ──────────────────────────────────────── */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <Building2 className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight">
                CivilBridge
              </span>
            </Link>

            {/* ── Desktop Nav Links ─────────────────────────── */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive(link.path)
                      ? "text-emerald-600 font-semibold bg-emerald-50"
                      : "font-medium text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                </Link>
              ))}
            </div>

            {/* ── Desktop Right ─────────────────────────────── */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                /* ── Authenticated ── */
                <>
                  {/* Notification bell */}
                  <NotificationInbox compact />

                  {/* Profile dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen((o) => !o)}
                      className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-gray-50 transition-all duration-200"
                      aria-expanded={dropdownOpen}
                      aria-haspopup="true"
                    >
                      {/* Avatar */}
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {initials}
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-sm font-semibold text-gray-800 max-w-[100px] truncate">{firstName}</p>
                        <p className="text-[11px] text-gray-400">{roleLabel}</p>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Dropdown panel */}
                    <div
                      className={`absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/80 transition-all duration-200 origin-top-right ${
                        dropdownOpen
                          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                      }`}
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.fullName || user.full_name || user.name || "User"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            <span className="inline-flex items-center mt-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                              {roleLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Nav items */}
                      <div className="py-1.5">
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          My Profile
                        </Link>
                        <Link
                          to="/dashboard/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <Settings className="h-4 w-4 text-gray-400" />
                          Settings
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 py-1.5">
                        <button
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                        >
                          <LogOut className="h-4 w-4" />
                          {loggingOut ? "Signing out…" : "Sign Out"}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* ── Unauthenticated ── */
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors px-3 py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-100 hover:shadow-emerald-200"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile Hamburger ──────────────────────────── */}
            <div className="md:hidden flex items-center gap-2">
              {isAuthenticated && user && (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              )}
              <button
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Overlay Menu ───────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          className={`absolute top-[72px] left-0 right-0 bg-white border-b border-gray-100 shadow-2xl transition-all duration-300 ${
            mobileMenuOpen ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">

            {/* Mobile user info (logged in) */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-emerald-50 rounded-xl">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.fullName || user.full_name || user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-4 py-3.5 rounded-xl text-base transition-all ${
                  isActive(link.path)
                    ? "text-emerald-600 font-semibold bg-emerald-50"
                    : "font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  <div className="px-1 pb-1">
                    <NotificationInbox />
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-center justify-center"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-all justify-center disabled:opacity-60"
                  >
                    <LogOut className="h-5 w-5" />
                    {loggingOut ? "Signing out…" : "Sign Out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-3.5 rounded-xl text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-all text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-3.5 bg-emerald-600 text-white text-base font-semibold rounded-xl hover:bg-emerald-700 transition-all text-center shadow-lg shadow-emerald-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
