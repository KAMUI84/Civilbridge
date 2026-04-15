import HeroSlider from "../../components/Home/HeroSlider";
import "./home.css";
import ScrollStory from "../../components/Home/scrollstory";
import SiteFooter from "../../components/common/SiteFooter";
import SEO from "../../components/seo/SEO";

export default function Home() {
  return (
    <div className="cb-home">
      <SEO
        title="CivilBridge — Rwanda's Construction Platform"
        description="Buy property, find build-ready land, explore architectural plans, estimate costs, and connect with verified construction experts across Rwanda."
      />
      <HeroSlider />

      {/* Scroll story / sections */}
      <ScrollStory />

      {/* <SiteFooter /> */}
    </div>
  );
}