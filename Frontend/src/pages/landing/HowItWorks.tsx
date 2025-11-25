export default function HowItWorks() {
  const steps = [
    "Register as a member",
    "Committee reviews your application",
    "Membership becomes active after approval + 60-day waiting period",
    "Submit claims within 90 days of treatment",
    "Committee reviews and processes claims",
    "Fund pays 80% — Member pays 20%",
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
        <ul className="space-y-4 text-gray-700 text-lg">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[#03045f] font-bold">{i + 1}.</span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
