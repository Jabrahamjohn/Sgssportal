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

// Public
import LandingPage from "./pages/landing/LandingPage";
import Login from "./containers/auth/login";
import Register from "./containers/auth/register";

// Member
import MemberDashboard from "./pages/dashboard/member";
import ClaimsList from "./pages/dashboard/member/claims";
import NewClaim from "./pages/dashboard/member/claims-new";
import ChronicPage from "./pages/dashboard/member/chronic";
import MemberClaimDetail from "./pages/dashboard/member/claim-detail";
import ClaimView from "./pages/dashboard/member/claim-view";
import MemberProfilePage from "./pages/dashboard/member/profile";
import MemberDependantsPage from "./pages/dashboard/member/dependants";

// Committee
import CommitteeDashboard from "./pages/dashboard/committee";
import CommitteeClaimDetail from "./pages/dashboard/committee/claim";
import CommitteeMembersPage from "./pages/dashboard/committee/members";
import CommitteeClaimsPage from "./pages/dashboard/committee/claims";
import CommitteeApplicationsPage from "./pages/dashboard/committee/applications";

// Admin
import AdminDashboard from "./pages/dashboard/admin";
import AdminAuditPage from "./pages/dashboard/admin/audit";
import AdminSettingsIndex from "./pages/dashboard/admin/settings";
import AdminMembershipTypes from "./pages/dashboard/admin/settings/membership-types";
import AdminReimbursementScales from "./pages/dashboard/admin/settings/reimbursement";
import AdminGeneralSettings from "./pages/dashboard/admin/settings/general-settings";
import AdminCommitteeSettings from "./pages/dashboard/admin/settings/committee";
import AdminRegistrations from "./pages/dashboard/admin/settings/registrations";
import AdminUsersPage from "./pages/dashboard/admin/users";

import NotFound from "./pages/404";


// ROLE REDIRECT
function RoleRedirect() {
  const { auth } = useAuth();
  const role = auth?.role?.toLowerCase();

  if (role === "admin") return <Navigate to="/dashboard/admin" replace />;
  if (role === "committee") return <Navigate to="/dashboard/committee" replace />;
  return <Navigate to="/dashboard/member" replace />;
}

// SMART REDIRECT
function SmartRedirect() {
  const nav = useNavigate();

  useEffect(() => {
    api.get("auth/me/")
      .then((res) => {
        if (res.data.role === "committee") nav("/dashboard/committee");
        else if (res.data.role === "admin") nav("/dashboard/admin");
        else nav("/dashboard/member");
      })
      .catch(() => nav("/login"));
  }, []);

  return <div className="p-6">Loading...</div>;
}


// MAIN ROUTER
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Auth */}
      <Route path="/login" element={<Unauthenticated><Login /></Unauthenticated>} />
      <Route path="/register" element={<Unauthenticated><Register /></Unauthenticated>} />

      {/* Protected */}
      <Route
        path="/dashboard/*"
        element={
          <Authenticated>
            <AppLayout />
          </Authenticated>
        }
      >
        <Route index element={<RoleRedirect />} />

        {/* MEMBER */}
        <Route path="member" element={<MemberDashboard />} />
        <Route path="member/claims" element={<ClaimsList />} />
        <Route path="member/claims/new" element={<NewClaim />} />
        <Route path="member/claims/:id" element={<MemberClaimDetail />} />
        <Route path="member/chronic" element={<ChronicPage />} />
        <Route path="member/profile" element={<MemberProfilePage />} />
        <Route path="member/dependants" element={<MemberDependantsPage />} />

        {/* COMMITTEE */}
        <Route path="committee" element={<CommitteeDashboard />} />
        <Route path="committee/claims" element={<CommitteeClaimsPage />} />
        <Route path="committee/claims/:id" element={<CommitteeClaimDetail />} />
        <Route path="committee/members" element={<CommitteeMembersPage />} />

        {/* ADMIN */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/audit" element={<AdminAuditPage />} />
        <Route path="admin/users" element={<AdminUsersPage />} />
        <Route path="admin/settings" element={<AdminSettingsIndex />} />
        <Route path="admin/settings/memberships" element={<AdminMembershipTypes />} />
        <Route path="admin/settings/reimbursement" element={<AdminReimbursementScales />} />
        <Route path="admin/settings/general" element={<AdminGeneralSettings />} />
        <Route path="admin/settings/committee" element={<AdminCommitteeSettings />} />
        <Route path="admin/settings/registrations" element={<AdminRegistrations />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
