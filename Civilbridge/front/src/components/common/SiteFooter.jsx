import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

/* Inline SVG brand icons — lucide-react removed brand icons in v1.x */
const FbIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const IgIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LiIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400">

      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand column */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
              <Building2 className="h-8 w-8 text-emerald-500 flex-shrink-0" />
              <span className="text-xl font-bold text-white tracking-tight">CivilBridge</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Rwanda&apos;s trusted construction intelligence platform. Making construction planning more accurate, transparent, and accessible for everyone.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-gray-500 hover:text-emerald-400 transition-colors duration-200"
                aria-label="Facebook"
              >
                <FbIcon />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-emerald-400 transition-colors duration-200"
                aria-label="Twitter / X"
              >
                <TwIcon />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-emerald-400 transition-colors duration-200"
                aria-label="Instagram"
              >
                <IgIcon />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-emerald-400 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <LiIcon />
              </a>
            </div>
          </div>

          {/* Platform column */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/plans"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                >
                  Plans Library
                </Link>
              </li>
              <li>
                <Link
                  to="/estimator"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                >
                  Cost Estimator
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  to="/intelligence"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                >
                  AI Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources column */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                >
                  Expert Directory
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Company</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} CivilBridge. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Made for Rwanda and East Africa
          </p>
        </div>
      </div>
    </footer>
  );
}
