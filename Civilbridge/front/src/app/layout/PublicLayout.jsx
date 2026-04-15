import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/SiteFooter";

const STANDALONE_PATHS = new Set(["/intelligence", "/ai-studio"]);

export default function PublicLayout() {
  const location = useLocation();
  const isStandalone = STANDALONE_PATHS.has(location.pathname);

  if (isStandalone) {
    return <Outlet />;
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 120px)" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
