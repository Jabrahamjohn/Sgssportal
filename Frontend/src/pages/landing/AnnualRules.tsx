// Frontend/src/pages/landing/AnnualRules.tsx
export default function AnnualRules() {
  const rules = [
    "Fund pays 80% of approved claims; Member pays 20%.",
    "Annual maximum benefit: Ksh 250,000 per individual member.",
    "Critical Illness top-up: additional Ksh 200,000 where applicable.",
    "Claims must be submitted within 90 days of treatment or discharge.",
    "New members must complete a 60-day waiting period before benefits apply.",
    "Membership subscriptions must be kept up-to-date for claims to be valid.",
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Annual Rules & Guidelines
        </h2>
        <ul className="space-y-3 text-gray-700 text-base md:text-lg">
          {rules.map((r, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="mt-1 text-[#03045f]">✔</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-gray-500">
          Full details are available in the SGSS Medical Fund Constitution and
          Byelaws, which remain the final reference in case of any dispute.
        </p>
      </div>
    </section>
  );
}
