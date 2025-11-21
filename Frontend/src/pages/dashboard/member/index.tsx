import React, { useEffect, useState } from "react";
import api from "~/config/api";
import { Link } from "react-router-dom";

interface Claim {
  id: string;
  claim_type: string;
  status: string;
  total_claimed: string;
  total_payable: string;
  created_at: string;
}

export default function MemberDashboard() {
  const [balance, setBalance] = useState<any>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [balRes, claimsRes] = await Promise.all([
          api.get("members/me/benefit_balance/"),
          api.get("claims/"),
        ]);
        setBalance(balRes.data);
        setClaims(claimsRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading…</div>;

  const recent = claims.slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-[#03045f]">Member Dashboard</h2>

      {/* Benefit summary */}
      {balance && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card title="Annual Limit" value={`Ksh ${Number(balance.annual_limit).toLocaleString()}`} />
          <Card title="Used So Far" value={`Ksh ${Number(balance.total_used).toLocaleString()}`} />
          <Card title="Remaining Balance" value={`Ksh ${Number(balance.remaining_balance).toLocaleString()}`} highlight />
        </div>
      )}

      {/* Recent claims */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#03045f]">Recent Claims</h3>
          <Link to="/dashboard/member/claims" className="text-sm text-[#caa631] hover:underline">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-600">
            You haven’t submitted any claims yet.{" "}
            <Link to="/dashboard/member/claims/new" className="text-[#caa631] underline">
              Submit your first claim
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Total Claimed</th>
                  <th className="text-left p-2">Payable</th>
                  <th className="text-left p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-2">{c.id.slice(0, 8)}…</td>
                    <td className="p-2 capitalize">{c.claim_type}</td>
                    <td className="p-2">{c.status}</td>
                    <td className="p-2">
                      Ksh {Number(c.total_claimed).toLocaleString()}
                    </td>
                    <td className="p-2">
                      Ksh {Number(c.total_payable).toLocaleString()}
                    </td>
                    <td className="p-2">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, value, highlight = false }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`p-4 rounded-lg shadow text-sm ${
        highlight ? "bg-[#caa631] text-white" : "bg-white"
      }`}
    >
      <p className="uppercase text-xs opacity-80">{title}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}
