// Frontend/src/router.tsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Unauthenticated from "./layout/protections/unauthenticated";
import Authenticated from "./layout/protections/authenticated";

import Login from "./containers/auth/login";
import Register from "./containers/auth/register";
import AppLayout from "./layout";

import MemberDashboard from "./pages/dashboard/member";
import ClaimsList from "./pages/dashboard/member/claims";
import NewClaim from "./pages/dashboard/member/claims-new";
import ChronicPage from "./pages/dashboard/member/chronic";
import MemberClaimDetail from "./pages/dashboard/member/claim-detail";
import ClaimView from "./pages/dashboard/member/claim-view";

import CommitteeDashboard from "./pages/dashboard/committee";
import CommitteeClaimDetail from "./pages/dashboard/committee/claim";
import CommitteeMembersPage from "./pages/dashboard/committee/members";

import AdminDashboard from "./pages/dashboard/admin";
import AdminSettings from "./pages/dashboard/admin/settings";
import AdminAuditPage from "./pages/dashboard/admin/audit";

import LandingPage from "./pages/landing/LandingPage";
import NotFound from "./pages/404";

import { useAuth } from "~/store/contexts/AuthContext";
import api from "~/config/api";


// =============================================================
// Redirect users based on ROLE
// =============================================================
function RoleRedirect() {
  const { auth } = useAuth();
  const role = auth?.role?.toLowerCase();

  if (role === "admin") return <Navigate to="/dashboard/admin" replace />;
  if (role === "committee") return <Navigate to="/dashboard/committee" replace />;
  return <Navigate to="/dashboard/member" replace />;
}


// =============================================================
// After login: redirect based on backend
// =============================================================
function SmartRedirect() {
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    api.get("auth/me/")
      .then(res => {
        const role = res.data.role;
        if (role === "committee") nav("/dashboard/committee");
        else if (role === "admin") nav("/dashboard/admin");
        else nav("/dashboard/member");
      })
      .catch(() => nav("/login"))
      .finally(() => setLoading(false));
  }, []);

  return <div className="p-6">Loading…</div>;
}


// =============================================================
// MAIN ROUTER
// =============================================================
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC LANDING PAGE */}
        <Route path="/" element={<LandingPage />} />

        {/* LOGIN + REGISTER */}
        <Route
          path="/login"
          element={
            <Unauthenticated>
              <Login />
            </Unauthenticated>
          }
        />

        <Route
          path="/register"
          element={
            <Unauthenticated>
              <Register />
            </Unauthenticated>
          }
        />


        {/* AUTHENTICATED AREA */}
        <Route
          path="/dashboard"
          element={
            <Authenticated>
              <AppLayout />
            </Authenticated>
          }
        >

          {/* AUTO-REDIRECT BASED ON ROLE */}
          <Route index element={<SmartRedirect />} />

          {/* ================= MEMBER ROUTES ================= */}
          <Route
            path="member"
            element={
              <Authenticated allowed={["member", "committee", "admin"]}>
                <MemberDashboard />
              </Authenticated>
            }
          />

          <Route path="member/claims" element={<ClaimsList />} />
          <Route path="member/claims/new" element={<NewClaim />} />
          <Route path="member/claims/:id" element={<ClaimView />} />
          <Route path="member/claim-detail/:id" element={<MemberClaimDetail />} />

          <Route path="member/chronic" element={<ChronicPage />} />


          {/* ================= COMMITTEE ROUTES ================= */}
          <Route
            path="committee"
            element={
              <Authenticated allowed={["committee", "admin"]}>
                <CommitteeDashboard />
              </Authenticated>
            }
          />

          <Route
            path="committee/claims/:id"
            element={
              <Authenticated allowed={["committee", "admin"]}>
                <CommitteeClaimDetail />
              </Authenticated>
            }
          />

          <Route
            path="committee/members"
            element={
              <Authenticated allowed={["committee", "admin"]}>
                <CommitteeMembersPage />
              </Authenticated>
            }
          />

          <Route
            path="committee/members/:id"
            element={
              <Authenticated allowed={["committee", "admin"]}>
                <CommitteeMembersPage />
              </Authenticated>
            }
          />


          {/* ================= ADMIN ROUTES ================= */}
          <Route
            path="admin"
            element={
              <Authenticated allowed={["admin"]}>
                <AdminDashboard />
              </Authenticated>
            }
          />

          <Route
            path="admin/settings"
            element={
              <Authenticated allowed={["admin"]}>
                <AdminSettings />
              </Authenticated>
            }
          />

          <Route
            path="admin/audit"
            element={
              <Authenticated allowed={["admin"]}>
                <AdminAuditPage />
              </Authenticated>
            }
          />

        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}
