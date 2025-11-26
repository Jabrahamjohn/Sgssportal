// Frontend/src/pages/landing/MembershipTypes.tsx
export default function MembershipTypes() {
  const types = [
    {
      name: "Single Member",
      desc: "Individual member covered under the standard annual limit.",
    },
    {
      name: "Family Membership",
      desc: "Member, spouse and eligible dependants covered as per rules.",
    },
    {
      name: "Senior Citizen",
      desc: "Special terms for senior members as defined in the Byelaws.",
    },
    {
      name: "Joint Membership",
      desc: "Jointly held membership where contributions and benefits are shared.",
    },
    {
      name: "Patron / Life Member",
      desc: "Long-term supporters of the Fund with special recognition.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Membership Types
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {types.map((t) => (
            <div
              key={t.name}
              className="p-6 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col gap-2"
            >
              <h3 className="font-semibold text-lg">{t.name}</h3>
              <p className="text-sm text-gray-600">{t.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">
          Exact eligibility, fees and limits are defined in the SGSS Medical
          Fund Constitution & Byelaws.
        </p>
      </div>
    </section>
  );
}
