import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "~/components/layout/DashboardLayout";
import api from "~/config/api";
import { useAuth } from "~/store/contexts/AuthContext";
import { Card } from "~/components/controls/card";
import { Table } from "~/components/controls/table";
import { Badge } from "~/components/controls/badge";
import { Button } from "~/components/controls/button";

type Claim = {
  id: string;
  claim_type: string;
  created_at: string;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected" | "paid";
  total_claimed: string;
  total_payable: string;
};

type MemberProfile = {
  id: string;
  full_name: string;
  email: string;
  membership_type: string | null;
  nhif_number: string | null;
  valid_from: string | null;
  valid_to: string | null;
};

export default function MemberDashboard() {
  const { auth } = useAuth();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Member profile (404 if user has no Member record)
        const prof = await api.get("members/me/");
        if (mounted) setMember(prof.data);

        // User claims (falls back to 0 if no claims yet)
        const res = await api.get("claims/", { params: { limit: 5 } });
        if (mounted) setClaims(res.data?.results ?? res.data ?? []);
      } catch {
        // Member profile missing is valid (new account) – we keep UI graceful.
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const total = claims.length;
    const approved = claims.filter((c) => c.status === "approved").length;
    const pending = claims.filter((c) =>
      ["submitted", "reviewed"].includes(c.status)
    ).length;
    const paid = claims.filter((c) => c.status === "paid").length;

    return { total, approved, pending, paid };
  }, [claims]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {auth?.user?.full_name || auth?.user?.username || "Member"}
          </h1>
          <p className="text-sm text-gray-600">
            Track your membership, submit claims, and view status updates.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-xs text-gray-500">Total Claims</div>
            <div className="mt-1 text-2xl font-semibold">{metrics.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-gray-500">Approved</div>
            <div className="mt-1 text-2xl font-semibold">{metrics.approved}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-gray-500">Pending</div>
            <div className="mt-1 text-2xl font-semibold">{metrics.pending}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-gray-500">Paid</div>
            <div className="mt-1 text-2xl font-semibold">{metrics.paid}</div>
          </Card>
        </div>

        {/* Membership snapshot */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Membership</div>
              {member ? (
                <div className="text-sm">
                  <div className="font-medium">
                    {member.membership_type || "Not Assigned"}
                  </div>
                  <div className="text-gray-600">
                    NHIF: {member.nhif_number || "—"}
                  </div>
                  <div className="text-gray-600">
                    Valid: {member.valid_from || "—"} → {member.valid_to || "—"}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  No member profile yet. If this is unexpected, contact support.
                </div>
              )}
            </div>
            <Button
              className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => (window.location.href = "/dashboard/member/claims")}
            >
              New Claim
            </Button>
          </div>
        </Card>

        {/* Recent claims */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <div className="text-sm font-semibold">Recent Claims</div>
          </div>
          <div className="p-4">
            <Table
              columns={[
                { key: "created_at", title: "Date" },
                { key: "claim_type", title: "Type" },
                {
                  key: "total_claimed",
                  title: "Amount (KSh)",
                  render: (v: string) => (
                    <span className="tabular-nums">{Number(v || 0).toLocaleString()}</span>
                  ),
                },
                {
                  key: "status",
                  title: "Status",
                  render: (_: any, row: Claim) => (
                    <Badge
                      text={row.status}
                      className={
                        row.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : row.status === "rejected"
                          ? "bg-rose-100 text-rose-700"
                          : row.status === "paid"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    />
                  ),
                },
              ]}
              data={claims}
              emptyMessage={loading ? "Loading..." : "No claims yet."}
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
 