import { Link } from "react-router";
import { Building2, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";


export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Building2 className="h-8 w-8 text-emerald-500" />
              <span className="text-xl font-bold text-white">CivilBridge</span>
            </Link>
            <p className="text-sm mb-4">
              Rwanda's trusted construction intelligence platform. Making construction planning more accurate, transparent, and accessible.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://x.com/" target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/plans" className="hover:text-emerald-500 transition-colors">Plans Library</Link></li>
              <li><Link to="/estimator" className="hover:text-emerald-500 transition-colors">Cost Estimator</Link></li>
              <li><Link to="/marketplace" className="hover:text-emerald-500 transition-colors">Marketplace</Link></li>
              <li><Link to="/intelligence" className="hover:text-emerald-500 transition-colors">AI Studio</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-emerald-500 transition-colors">Documentation</Link></li>
              <li><Link to="/help-center" className="hover:text-emerald-500 transition-colors">Help Center</Link></li>
              <li><Link to="/experts" className="hover:text-emerald-500 transition-colors">Expert Directory</Link></li>
              <li><Link to="/blog" className="hover:text-emerald-500 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-emerald-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-500 transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2026 CivilBridge. All rights reserved. Made for Rwanda and East Africa.</p>
        </div>
      </div>
    </footer>
  );
}
