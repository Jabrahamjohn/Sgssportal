// Frontend/src/pages/landing/CTA.tsx
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="py-16 px-6 text-center bg-gradient-to-r from-[#03045f] to-[#caa631] text-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-3">
          Ready to Join the SGSS Medical Fund?
        </h2>
        <p className="opacity-90 mb-8 text-base md:text-lg">
          New members can apply online, and existing members can log in to
          track claims, benefits, and approvals in real time.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-3 bg-white text-[#03045f] font-semibold rounded-lg shadow-md hover:bg-gray-100 transition"
          >
            Apply for Membership
          </Link>

          <Link
            to="/login"
            className="px-8 py-3 border border-white rounded-lg font-semibold hover:bg-white/10 transition"
          >
            Member Login
          </Link>
        </div>
      </div>
    </section>
  );
}
