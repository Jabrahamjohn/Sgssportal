// Frontend/src/pages/landing/LandingPage.tsx
import { Link } from "react-router-dom";
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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#03045f] via-[#193c74] to-[#caa631]" />
            <div>
              <p className="text-sm font-semibold tracking-wide text-[#03045f]">
                SGSS Medical Fund
              </p>
              <p className="text-[11px] text-gray-500">
                Siri Guru Singh Sabha · Mombasa
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#about" className="hover:text-[#03045f]">
              About
            </a>
            <a href="#how" className="hover:text-[#03045f]">
              How It Works
            </a>
            <a href="#benefits" className="hover:text-[#03045f]">
              Benefits
            </a>
            <a href="#types" className="hover:text-[#03045f]">
              Membership Types
            </a>
            <a href="#rules" className="hover:text-[#03045f]">
              Rules
            </a>
            <a href="#committee" className="hover:text-[#03045f]">
              Committee
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex px-4 py-1.5 text-sm font-semibold border border-[#03045f] text-[#03045f] rounded-full hover:bg-[#03045f] hover:text-white transition"
            >
              Member Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-[#03045f] to-[#caa631] text-white shadow-sm hover:shadow-md transition"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </header>

      {/* Main sections */}
      <main className="flex-1 w-full overflow-x-hidden">
        <Hero />

        <section id="about">
          <About />
        </section>

        <section id="how">
          <HowItWorks />
        </section>

        <section id="benefits">
          <Benefits />
        </section>

        <section id="types">
          <MembershipTypes />
        </section>

        <section id="rules">
          <AnnualRules />
        </section>

        <section id="committee">
          <Committee />
        </section>

        <CTA />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 py-4">
        <div className="max-w-6xl mx-auto px-4 text-xs text-gray-500 flex flex-wrap items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} SGSS Medical Fund · Siri Guru Singh Sabha Mombasa
          </span>
          <span>Governed by SGSS Constitution & Byelaws · 2024</span>
        </div>
      </footer>
    </div>
  );
}
