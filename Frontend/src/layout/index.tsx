import { Outlet } from 'react-router-dom';
import DashboardLayout from './dashboard_layout';

const AppLayout = () => {
  return (
    <DashboardLayout>
      <main>
        <Outlet />
      </main>
    </DashboardLayout>
  );
};
export default AppLayout;
