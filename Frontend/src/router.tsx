import {
  createBrowserRouter,
  ScrollRestoration,
  Outlet,
  type RouteObject,
} from 'react-router-dom';

import * as pageRoutes from './config/routes';

// External
import HomePage from './pages/external';

// Onboarding and Registration

// Dashboard
import DashboardPage from './pages/dashboard';

// Others
import ErrorPage from './pages/error';
import NotFoundPage from './pages/404';

// Protections
import CheckAuth from './layout/protections/check-auth';
import Authenticated from './layout/protections/authenticated';
import NotAuthenticated from './layout/protections/unauthenticated';

const routes: RouteObject[] = [
  {
    element: (
      <>
        <CheckAuth>
          <Outlet />
        </CheckAuth>
        <ScrollRestoration />
      </>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        element: (
          <NotAuthenticated>
            <Outlet />
          </NotAuthenticated>
        ),
        children: [
          // External Pages
          { path: pageRoutes.HOME_PAGE, element: <HomePage /> },
          // Onboarding and Registration
        ],
      },
      {
        element: (
          <Authenticated>
            <Outlet />
          </Authenticated>
        ),
        children: [
          {
            path: pageRoutes.DASHBOARD_PAGE,
            element: <DashboardPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

const router = createBrowserRouter(routes);

export default router;
