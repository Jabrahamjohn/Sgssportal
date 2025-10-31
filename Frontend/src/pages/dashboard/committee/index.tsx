// Frontend/src/pages/dashboard/committee/index.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import  Card  from "~/components/controls/card";
import  Table  from "~/components/controls/table";
import  Button  from "~/components/controls/button";
import  Badge from "~/components/controls/badge";
import  Spin  from "~/components/controls/spin";
import formatCurrency  from "~/utils/format-price";

interface Claim {
  id: string;
  claim_type: string;
  member_name: string;
  total_claimed: number;
  status: string;
  created_at: string;
}

export default function CommitteeDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // 🔹 Fetch claims
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await api.get("/medical/claims/");
        setClaims(res.data || []);
        const pending = res.data.filter((c: any) => c.status === "submitted").length;
        const approved = res.data.filter((c: any) => c.status === "approved").length;
        const rejected = res.data.filter((c: any) => c.status === "rejected").length;
        setStats({
          total: res.data.length,
          pending,
          approved,
          rejected,
        });
      } catch (err) {
        console.error("Failed to fetch claims:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  // 🔹 Handle status update
  const handleAction = async (id: string, status: string) => {
    try {
      await api.post(`/medical/claims/${id}/set_status/`, { status });
      setClaims((prev) =>
        prev.map((claim) =>
          claim.id === id ? { ...claim, status } : claim
        )
      );
    } catch (err) {
      console.error(`Failed to update claim ${id}:`, err);
    }
  };

  if (loading) return <Spin fullscreen />;

  return (
    <div className="space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Claims">
          <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
        </Card>
        <Card title="Pending Review">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </Card>
        <Card title="Approved">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </Card>
        <Card title="Rejected">
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </Card>
      </div>

      {/* Claims Table */}
      <Card title="Claims Review Queue">
        <Table>
          <thead>
            <tr className="text-left bg-gray-100">
              <th className="p-2">Member</th>
              <th className="p-2">Claim Type</th>
              <th className="p-2">Total Claimed</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{claim.member_name}</td>
                <td className="p-2 capitalize">{claim.claim_type}</td>
                <td className="p-2">{formatCurrency(claim.total_claimed)}</td>
                <td className="p-2">
                  <Badge
                    color={
                      claim.status === "approved"
                        ? "green"
                        : claim.status === "rejected"
                        ? "red"
                        : "yellow"
                    }
                    text={claim.status}
                  />
                </td>
                <td className="p-2 flex justify-end gap-2">
                  {claim.status === "submitted" && (
                    <>
                      <Button
                        size="small"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAction(claim.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleAction(claim.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {claim.status === "approved" && (
                    <Button
                      size="small"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleAction(claim.id, "paid")}
                    >
                      Mark Paid
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
