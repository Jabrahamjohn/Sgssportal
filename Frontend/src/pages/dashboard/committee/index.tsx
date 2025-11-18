// Frontend/src/pages/dashboard/committee/index.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import ClaimsTable from "./claims-table";
import StatsCards from "./stats-cards";

type MeResponse = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;            // "Member", "Committee", "Admin"
  groups?: string[];       // ["Member", "Admin", "Committee"]
  is_superuser?: boolean;
};

export default function CommitteeDashboard() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    api
      .get("auth/me/")
      .then((res) => {
        const user = res.data as MeResponse;
        setMe(user);

        const groups = user.groups || [];
        const isCommittee =
          user.role === "Committee" ||
          groups.includes("Committee") ||
          groups.includes("Admin") ||
          user.is_superuser;

        if (!isCommittee) setForbidden(true);
      })
      .catch(() => {
        setForbidden(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  if (forbidden || !me) {
    return (
      <div className="p-6 space-y-3">
        <h2 className="text-xl font-semibold text-red-600">
          Restricted – Committee Only
        </h2>
        <p className="text-sm text-gray-700">
          This area is reserved for the{" "}
          <strong>Medical Fund Committee / Admins</strong> to review and process
          claims. Your account is currently in the{" "}
          <strong>{me?.role || "Member"}</strong> role.
        </p>
        <p className="text-sm text-gray-600">
          If you believe this is an error, please contact the SGSS Medical Fund
          administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Medical Fund – Committee Claims
        </h2>
        <p className="text-sm text-gray-600">
          Logged in as <strong>{me.full_name}</strong> (
          <span className="font-mono">{me.email}</span>)
        </p>
      </div>

      {/* Top statistics for committee */}
      <StatsCards />

      {/* Main table of claims */}
      <ClaimsTable />
    </div>
  );
}
