import HeroSlider from "../../components/Home/HeroSlider";
import "./home.css";
import ScrollStory from "../../components/Home/scrollstory";
import SiteFooter from "../../components/common/SiteFooter";

export default function Home() {
  return (
    <div className="cb-home">
      <HeroSlider />

      {/* Scroll story / sections */}
      <ScrollStory />

      {/* <SiteFooter /> */}
    </div>
  );
}