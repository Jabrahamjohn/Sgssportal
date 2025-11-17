// Frontend/src/router.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Unauthenticated from "./layout/protections/unauthenticated";
import Authenticated from "./layout/protections/authenticated";
import Login from "./containers/auth/login";
import Register from "./containers/auth/register";
import AppLayout from "./layout";

import MemberDashboard from "./pages/dashboard/member";
import ClaimsList from "./pages/dashboard/member/claims";
import NewClaim from "./pages/dashboard/member/claims-new";
import ChronicPage from "./pages/dashboard/member/chronic";

import CommitteeDashboard from "./pages/dashboard/committee";
import AdminDashboard from "./pages/dashboard/admin";
import AdminSettings from "./pages/dashboard/admin/settings";
import NotFound from "./pages/404";
// Add below imports
import { useAuth } from "~/store/contexts/AuthContext";
import MemberClaimDetail from "./pages/dashboard/member/claim-detail";

function RoleRedirect() {
  const { auth } = useAuth();
  const role = auth?.role?.toLowerCase();

  if (role === "admin") return <Navigate to="/dashboard/admin" replace />;
  if (role === "committee") return <Navigate to="/dashboard/committee" replace />;
  return <Navigate to="/dashboard/member" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
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

        {/* MAIN APP */}
        <Route
          path="/"
          element={
            <Authenticated>
              <AppLayout />
            </Authenticated>
          }
        >
          {/* Default redirect */}
          <Route index element={<RoleRedirect />} />

          {/* ✅ Member Dashboard */}
          <Route
            path="dashboard/member"
            element={
              <Authenticated allowed={["member", "committee", "admin"]}>
                <MemberDashboard />
              </Authenticated>
            }
          />
          <Route
            path="dashboard/member/claims/:id"
            element={<MemberClaimDetail />}
          />

          <Route path="dashboard/member/claims" element={<ClaimsList />} />
          <Route path="dashboard/member/claims/new" element={<NewClaim />} />
          <Route path="dashboard/member/chronic" element={<ChronicPage />} />

          {/* Committee Dashboard */}
          <Route
            path="dashboard/committee"
            element={
              <Authenticated allowed={["committee", "admin"]}>
                <CommitteeDashboard />
              </Authenticated>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="dashboard/admin"
            element={
              <Authenticated allowed={["admin"]}>
                <AdminDashboard />
              </Authenticated>
            }
          />
          <Route
            path="dashboard/admin/settings"
            element={
              <Authenticated allowed={["admin"]}>
                <AdminSettings />
              </Authenticated>
            }
          />
        </Route>

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
