// src/app/layout/PublicLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/SiteFooter";

export default function PublicLayout() {
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