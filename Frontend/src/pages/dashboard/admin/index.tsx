import AdminDashboardContainer from '~/containers/dashboard/admin';
import { Title } from '~/utils/components';

const AdminDashboard = () => {
  return (
    <>
      <Title
        title='Admin Dashboard'
        description='Dashboard for the admin of the SGGSS Medical Fund'
      />
      <AdminDashboardContainer />
    </>
  );
};
export default AdminDashboard;
