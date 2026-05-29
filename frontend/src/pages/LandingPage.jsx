import HeroSection from "../components/HeroSection"
import { FeatureDescription } from "../components/FeatureDescription"
import Navbar from "../components/Navbar"
import { Faq } from "../components/Faq"
import Testimonials from "../components/mvpblocks/testimonials-marquee"
import FooterGlow from "../components/mvpblocks/footer-glow"


function App() {

  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeatureDescription
        badge="✨ Your User Fitness Profile"
        heading="Personalized Insights for Better Performance"
        description="A quick overview of your health, activity level, and fitness goals—crafted to help you track progress and personalize your fitness journey."
        buttons={{
          secondary: {
            text: "Get Started",
            url: "/home/fitness-profile"
          }
        }}
        image={{
          src: "/feature-1-image.jpg",
          alt: "A muscular man running down the streets."
        }}
      />
      <FeatureDescription
        badge="🎥 Seamless Video Calling"
        heading="Connect Clearly, Anytime, Anywhere"
        reverse={true}
        description="Experience smooth, high-quality video calls designed to keep you connected with friends, family, and teams—no matter the distance."
        buttons={{
          secondary: {
            text: "Start a Call",
            url: "https://www.shadcnblocks.com"
          }
        }}
        image={{
          src: "/feature-2-image.jpg",
          alt: "Person."
        }}
      />

      <FeatureDescription
        badge="💖 Support With a Donation"
        heading="Make an Impact With Every Contribution"
        description="Help drive meaningful change by contributing to causes that matter. Your donation empowers communities and supports ongoing initiatives."
        buttons={{
          secondary: {
            text: "Donate Now",
            url: "https://www.shadcnblocks.com"
          }
        }}
        image={{
          src: "/feature-3-image.jpg",
          alt: "Person offering support."
        }}
      />
      <Testimonials />
      <Faq />
      <FooterGlow />


    </div>
  )
}

export default App