import Hero from "./Hero";
import About from "./About";
import HowItWorks from "./HowItWorks";
import Benefits from "./Benefits";
import MembershipTypes from "./MembershipTypes";
import AnnualRules from "./AnnualRules";
import Committee from "./Committee";
import CTA from "./CTA";

export default function LandingPage() {
  return (
    <div className="w-full overflow-x-hidden">
      <Hero />
      <About />
      <HowItWorks />
      <Benefits />
      <MembershipTypes />
      <AnnualRules />
      <Committee />
      <CTA />
    </div>
  );
}
