export default function Benefits() {
  const items = [
    "Outpatient medical expenses",
    "Inpatient hospitalization support",
    "Chronic illness medication assistance",
    "Critical illness top-up (Ksh 200,000)",
    "Annual benefit limit of Ksh 250,000 per member",
    "Mandatory NHIF integration for claims",
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Benefits</h2>
        <ul className="grid md:grid-cols-2 gap-4 text-gray-700">
          {items.map((b, i) => (
            <li key={i} className="p-4 bg-gray-50 rounded-lg shadow-sm">
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
