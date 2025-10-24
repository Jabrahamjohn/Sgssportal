import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Unauthenticated from './layout/protections/unauthenticated';
import Authenticated from './layout/protections/authenticated';
import Login from './containers/auth/login';
import AppLayout from './layout';

import MemberDashboard from './pages/dashboard/member';
import ClaimsList from './pages/dashboard/member/claims';
import NewClaim from './pages/dashboard/member/claims-new';
import ChronicPage from './pages/dashboard/member/chronic';

import CommitteeDashboard from './pages/dashboard/committee';
import AdminDashboard from './pages/dashboard/admin';
import AdminSettings from './pages/dashboard/admin/settings';
import NotFound from './pages/404';

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
          <Route index element={<Navigate to="/dashboard/member" replace />} />

          {/* Member Dashboard */}
          <Route path="dashboard/member" element={<MemberDashboard />} />
          <Route path="dashboard/member/claims" element={<ClaimsList />} />
          <Route path="dashboard/member/claims/new" element={<NewClaim />} />
          <Route path="dashboard/member/chronic" element={<ChronicPage />} />

          {/* Committee Dashboard */}
          <Route
            path="dashboard/committee"
            element={
              <Authenticated roles={['committee', 'admin']}>
                <CommitteeDashboard />
              </Authenticated>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="dashboard/admin"
            element={
              <Authenticated roles={['admin']}>
                <AdminDashboard />
              </Authenticated>
            }
          />
          <Route
            path="dashboard/admin/settings"
            element={
              <Authenticated roles={['admin']}>
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
