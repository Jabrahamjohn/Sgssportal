// Frontend/src/pages/landing/HowItWorks.tsx
export default function HowItWorks() {
  const steps = [
    "Register as a member and choose your membership type.",
    "The Medical Fund Committee reviews and approves your application.",
    "Membership becomes active once approved and subscriptions are paid.",
    "Benefits start after a 60-day waiting period from activation.",
    "Submit claims within 90 days of treatment or discharge.",
    "The Committee reviews your claim in line with the Byelaws.",
    "The Fund pays its share and you settle the member’s portion.",
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
        <ul className="space-y-4 text-gray-700 text-base md:text-lg">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="mt-1 text-sm font-bold text-[#03045f] w-6 text-right">
                {i + 1}.
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
