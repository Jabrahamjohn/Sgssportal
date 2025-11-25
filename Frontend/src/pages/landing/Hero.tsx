import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-[#03045f] via-[#082e68] to-[#caa631] text-white py-32 px-6 text-center">
      <h1 className="text-5xl font-extrabold mb-6 tracking-wide">
        SGSS Medical Fund
      </h1>
      <p className="text-xl max-w-3xl mx-auto opacity-90">
        A unified healthcare support system for our community — empowering
        well-being through compassion, structure, and sustainability.
      </p>

      <div className="mt-8 flex justify-center gap-6">
        <Link
          to="/register"
          className="px-8 py-3 bg-white text-[#03045f] font-semibold rounded-lg shadow-md hover:bg-gray-100"
        >
          Apply for Membership
        </Link>

        <Link
          to="/login"
          className="px-8 py-3 bg-transparent border border-white rounded-lg font-semibold hover:bg-white/20"
        >
          Member Login
        </Link>
      </div>
    </section>
  );
}
