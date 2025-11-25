export default function MembershipTypes() {
  const types = [
    "Single Member",
    "Family Membership",
    "Senior Citizen",
    "Joint Membership",
    "Patron / Life Member",
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Membership Types
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {types.map((t, i) => (
            <div
              key={i}
              className="p-6 text-center bg-white rounded-xl shadow-md border"
            >
              <h3 className="font-semibold text-xl">{t}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
