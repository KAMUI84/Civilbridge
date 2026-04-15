import { Link, useLocation } from "react-router-dom";
import { Building2, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const AUTH_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Marketplace", path: "/marketplace" },
  { name: "Plans", path: "/plans" },
  { name: "Estimator", path: "/estimator" },
  { name: "AI Studio", path: "/intelligence" },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (AUTH_ROUTES.has(location.pathname)) {
    return null;
  }

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

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
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <Building2 className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight">
                CivilBridge
              </span>
            </Link>

            {/* Desktop Nav */}
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

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
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
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Slide-in panel */}
        <div
          className={`absolute top-[72px] left-0 right-0 bg-white border-b border-gray-100 shadow-2xl transition-all duration-300 ${
            mobileMenuOpen ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-1">
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

            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
