import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Unauthenticated from './layout/protections/unauthenticated';
// import Authenticated from './layout/protections/authenticated';
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
import { pageRoutes } from './config/routes';
import MembershipPage from './pages/dashboard/member/membership';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path={pageRoutes.LOGIN_PAGE}
          element={
            // <Unauthenticated>
            <Login />
            // </Unauthenticated>
          }
        />

        {/* MAIN APP */}
        <Route
          path={pageRoutes.HOME_PAGE}
          element={
            // <Authenticated>
            <AppLayout />
            // </Authenticated>
          }
        >
          {/* Default redirect */}
          <Route index element={<Navigate to={pageRoutes.MEMBERS} replace />} />

          {/* Member Dashboard */}
          <Route path={pageRoutes.MEMBERS} element={<MemberDashboard />} />
          <Route path={pageRoutes.MEMBERS_CLAIMS} element={<ClaimsList />} />
          <Route path={pageRoutes.MEMBERS_CLAIMS_NEW} element={<NewClaim />} />
          <Route path={pageRoutes.MEMBERSHIP} element={<MembershipPage />} />
          <Route path={pageRoutes.MEMBER_CHRONIC} element={<ChronicPage />} />

          {/* Committee Dashboard */}
          <Route
            path={pageRoutes.COMMITTE}
            element={
              // <Authenticated roles={['committee', 'admin']}>
              <CommitteeDashboard />
              // </Authenticated>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path={pageRoutes.ADMIN}
            element={
              // <Authenticated roles={['admin']}>
              <AdminDashboard />
              // </Authenticated>
            }
          />
          <Route
            path={pageRoutes.ADMIN_SETTINGS}
            element={
              // <Authenticated roles={['admin']}>
              <AdminSettings />
              // </Authenticated>
            }
          />
        </Route>

        {/* Not Found */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
