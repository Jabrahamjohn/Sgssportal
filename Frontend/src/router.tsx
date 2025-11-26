// Frontend/src/router.tsx
import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import api from "~/config/api";
import { useAuth } from "~/store/contexts/AuthContext";

import Unauthenticated from "./layout/protections/unauthenticated";
import Authenticated from "./layout/protections/authenticated";
import AppLayout from "./layout";

// --- Public Pages ---
import LandingPage from "./pages/landing/LandingPage";
import Login from "./containers/auth/login";
import Register from "./containers/auth/register";

// --- Member Pages ---
import MemberDashboard from "./pages/dashboard/member";
import ClaimsList from "./pages/dashboard/member/claims";
import NewClaim from "./pages/dashboard/member/claims-new";
import ChronicPage from "./pages/dashboard/member/chronic";
import MemberClaimDetail from "./pages/dashboard/member/claim-detail";
import ClaimView from "./pages/dashboard/member/claim-view";

// --- Committee Pages ---
import CommitteeDashboard from "./pages/dashboard/committee";
import CommitteeClaimDetail from "./pages/dashboard/committee/claim";
import CommitteeMembersPage from "./pages/dashboard/committee/members";

// --- Admin Pages ---
import AdminDashboard from "./pages/dashboard/admin";
import AdminAuditPage from "./pages/dashboard/admin/audit";

// --- Admin Settings ---
import AdminSettingsIndex from "./pages/dashboard/admin/settings";
import AdminMembershipTypes from "./pages/dashboard/admin/settings/membership-types";
import AdminReimbursementScales from "./pages/dashboard/admin/settings/reimbursement";
import AdminGeneralSettings from "./pages/dashboard/admin/settings/general-settings";
import AdminCommitteeSettings from "./pages/dashboard/admin/settings/committee";
import AdminRegistrations from "./pages/dashboard/admin/settings/registrations";

import NotFound from "./pages/404";


// =========================================================
//   ROLE REDIRECT
// =========================================================
function RoleRedirect() {
  const { auth } = useAuth();
  const role = auth?.role?.toLowerCase();

  if (role === "admin") return <Navigate to="/dashboard/admin" replace />;
  if (role === "committee") return <Navigate to="/dashboard/committee" replace />;
  return <Navigate to="/dashboard/member" replace />;
}


// =========================================================
//   SMART REDIRECT (After Login)
// =========================================================
function SmartRedirect() {
  const nav = useNavigate();

  useEffect(() => {
    api
      .get("auth/me/")
      .then((res) => {
        const role = res.data.role;
        if (role === "committee") nav("/dashboard/committee");
        else if (role === "admin") nav("/dashboard/admin");
        else nav("/dashboard/member");
      })
      .catch(() => nav("/login"));
  }, []);

  return <div className="p-6">Loading...</div>;
}


// =========================================================
//   MAIN ROUTER
// =========================================================
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}
        <Route path="/" element={<LandingPage />} />

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


        {/* =====================================================
            PROTECTED APP LAYOUT
        ===================================================== */}
        <Route
          path="/"
          element={
            <Authenticated>
              <AppLayout />
            </Authenticated>
          }
        >
          {/* index → auto redirect based on role */}
          <Route index element={<RoleRedirect />} />

          {/* dashboard → auto route after login */}
          <Route path="dashboard" element={<SmartRedirect />} />


          {/* ==========================
              MEMBER ROUTES
          =========================== */}
          <Route path="dashboard/member" element={<MemberDashboard />} />
          <Route path="dashboard/member/claims" element={<ClaimsList />} />
          <Route path="dashboard/member/claims/new" element={<NewClaim />} />
          <Route path="dashboard/member/claims/:id" element={<MemberClaimDetail />} />
          <Route path="dashboard/member/claims/:id/view" element={<ClaimView />} />
          <Route path="dashboard/member/chronic" element={<ChronicPage />} />


          {/* ==========================
              COMMITTEE ROUTES
          =========================== */}
          <Route path="dashboard/committee" element={<CommitteeDashboard />} />
          <Route path="dashboard/committee/claims/:id" element={<CommitteeClaimDetail />} />
          <Route path="dashboard/committee/members" element={<CommitteeMembersPage />} />


          {/* ==========================
              ADMIN ROUTES
          =========================== */}
          <Route path="dashboard/admin" element={<AdminDashboard />} />
          <Route path="dashboard/admin/audit" element={<AdminAuditPage />} />


          {/* ---------------------------
              ADMIN SETTINGS SECTIONS
          --------------------------- */}
          <Route path="dashboard/admin/settings" element={<AdminSettingsIndex />} />
          <Route path="dashboard/admin/settings/memberships" element={<AdminMembershipTypes />} />
          <Route path="dashboard/admin/settings/reimbursement" element={<AdminReimbursementScales />} />
          <Route path="dashboard/admin/settings/general" element={<AdminGeneralSettings />} />
          <Route path="dashboard/admin/settings/committee" element={<AdminCommitteeSettings />} />
          <Route path="dashboard/admin/settings/registrations" element={<AdminRegistrations />} />

        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}
