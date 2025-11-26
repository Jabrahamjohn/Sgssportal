// Frontend/src/pages/landing/Hero.tsx
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-[#03045f] via-[#082e68] to-[#caa631] text-white py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center gap-6">
        <p className="uppercase tracking-[0.25em] text-xs md:text-[11px] text-white/80">
          Siri Guru Singh Sabha · Community Medical Support
        </p>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
          SGSS Medical Fund
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-95">
          A structured medical support fund for the SGSS community, providing
          outpatient, inpatient, and chronic illness benefits under clear
          rules and transparent governance.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-3 bg-white text-[#03045f] font-semibold rounded-lg shadow-md hover:bg-gray-100 transition"
          >
            Apply for Membership
          </Link>

          <Link
            to="/login"
            className="px-8 py-3 bg-transparent border border-white/80 rounded-lg font-semibold hover:bg-white/10 transition"
          >
            Existing Member Login
          </Link>
        </div>

        <p className="text-sm text-white/80 mt-2">
          Benefits start after a 60-day waiting period and are governed by the
          SGSS Medical Fund Byelaws.
        </p>
      </div>
    </section>
  );
}
