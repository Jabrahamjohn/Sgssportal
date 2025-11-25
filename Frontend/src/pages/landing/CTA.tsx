import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="py-16 text-center bg-gradient-to-r from-[#03045f] to-[#caa631] text-white">
      <h2 className="text-3xl font-bold mb-4">Join the SGSS Medical Fund</h2>
      <p className="opacity-90 mb-8">
        Apply for membership or log in to manage your health benefits.
      </p>

      <div className="flex justify-center gap-6">
        <Link
          to="/register"
          className="px-8 py-3 bg-white text-[#03045f] font-semibold rounded-lg"
        >
          Apply Now
        </Link>

        <Link
          to="/login"
          className="px-8 py-3 border border-white rounded-lg font-semibold hover:bg-white/10"
        >
          Member Login
        </Link>
      </div>
    </section>
  );
}
