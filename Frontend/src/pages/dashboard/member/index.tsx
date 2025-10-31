// frontend/src/pages/dashboard/member/index.tsx
import React, { useEffect, useState } from "react";
import api from "~/config/api";
import { useAuth } from "~/store/contexts/AuthContext";
import Card from "~/components/controls/card";
import Badge from "~/components/controls/badge";
import Button from "~/components/controls/button";
import Table  from "~/components/controls/table";
import { PlusCircle, FileText, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function MemberDashboard() {
  const { auth } = useAuth();
  const [member, setMember] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [memberRes, claimsRes] = await Promise.all([
          api.get("/members/me/"),
          api.get("/claims/"),
        ]);
        setMember(memberRes.data);
        setClaims(claimsRes.data.results || claimsRes.data);
      } catch (err) {
        console.error("Failed to load member dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[70vh] text-gray-500">
        Loading dashboard...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {auth.user?.full_name || "Member"} 👋
        </h1>
        <p className="text-gray-500 text-sm">
          Here’s an overview of your medical fund usage and claims.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <div className="p-4">
            <h3 className="text-gray-500 text-sm">Membership Type</h3>
            <p className="text-lg font-semibold text-gray-800 mt-1">
              {member?.membership_type || "N/A"}
            </p>
            <Badge color="blue" className="mt-2">
              Active
            </Badge>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-gray-500 text-sm">NHIF Number</h3>
            <p className="text-lg font-semibold text-gray-800 mt-1">
              {member?.nhif_number || "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Linked</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-gray-500 text-sm">Valid Until</h3>
            <p className="text-lg font-semibold text-gray-800 mt-1">
              {member?.valid_to || "N/A"}
            </p>
            <Badge color="green" className="mt-2">
              Active Coverage
            </Badge>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-gray-500 text-sm">Total Claims</h3>
            <p className="text-lg font-semibold text-gray-800 mt-1">
              {claims.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">This Year</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link to="/dashboard/member/claims/new">
          <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            New Claim
          </Button>
        </Link>

        <Link to="/dashboard/member/chronic">
          <Button className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Chronic Request
          </Button>
        </Link>
      </div>

      {/* Recent Claims Table */}
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Claims
            </h3>
            <Link
              to="/dashboard/member/claims"
              className="text-blue-600 text-sm hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-t">
              <thead>
                <tr className="text-gray-500 bg-gray-50 border-b text-left">
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Total Claimed</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {claims.slice(0, 5).map((claim) => (
                  <tr
                    key={claim.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2 capitalize">
                      {claim.claim_type || "—"}
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        color={
                          claim.status === "approved"
                            ? "green"
                            : claim.status === "rejected"
                            ? "red"
                            : "blue"
                        }
                      >
                        {claim.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      Ksh {claim.total_claimed || 0}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {claims.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center text-gray-500 py-6 italic"
                    >
                      No claims found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
