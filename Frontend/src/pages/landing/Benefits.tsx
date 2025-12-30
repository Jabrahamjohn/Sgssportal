// Frontend/src/pages/landing/Benefits.tsx
export default function Benefits() {
  const items = [
    "Outpatient medical consultations, investigations and medicines.",
    "Inpatient hospitalization support according to approved scales.",
    "Chronic illness medication assistance for registered chronic cases.",
    "Critical illness top-up of Ksh 200,000 for qualifying cases.",
    "Annual benefit limit of Ksh 250,000 per individual member.",
    "Mandatory SHIF/SHA and other schemes are offset before Fund pays.",
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Benefits</h2>
        <ul className="grid md:grid-cols-2 gap-4 text-gray-700">
          {items.map((b, i) => (
            <li
              key={i}
              className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
            >
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
