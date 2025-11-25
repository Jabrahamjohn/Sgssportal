export default function AnnualRules() {
  const rules = [
    "Fund pays 80%, Member pays 20%",
    "Annual maximum benefit: Ksh 250,000",
    "Critical Illness top-up: Ksh 200,000",
    "Claims must be submitted within 90 days",
    "60-day waiting period for new members",
    "Membership must remain valid (paid)",
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Annual Rules & Guidelines
        </h2>
        <ul className="space-y-2 text-gray-700 text-lg">
          {rules.map((r, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[#03045f]">✔</span> {r}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
