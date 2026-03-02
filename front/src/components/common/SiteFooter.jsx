import { Link } from "react-router-dom";
import "./siteFooter.css";

export default function SiteFooter() {
  return (
    <footer className="cb-footer">
      <div className="cb-footerWrap">
        <div className="cb-footerTop">
          <div>
            <div className="cb-footerBrand">CivilBridge</div>
            <p className="cb-footerText">
              A practical construction + property ecosystem: listings, plans, estimation,
              experts, and compliance — built to work today and evolve over time.
            </p>
          </div>

          <div className="cb-footerCols">
            <div>
              <div className="cb-footerTitle">Platform</div>
              <Link to="/marketplace">Marketplace</Link>
              <Link to="/plans">Plans</Link>
              <Link to="/estimator">Estimator</Link>
              <Link to="/experts">Experts</Link>
            </div>

            <div>
              <div className="cb-footerTitle">Company</div>
              <a href="#how-it-works">How it works</a>
              <Link to="/register">Join</Link>
              <Link to="/login">Sign in</Link>
            </div>

            <div>
              <div className="cb-footerTitle">Legal</div>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>

        <div className="cb-footerBottom">
          <span>© {new Date().getFullYear()} CivilBridge. All rights reserved.</span>
          <span className="cb-footerSmall">Support • Help Center • Security</span>
        </div>
      </div>
    </footer>
  );
}