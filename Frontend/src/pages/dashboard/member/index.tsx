import MembersContainer from '~/containers/dashboard/member';
import { Title } from '~/utils/components';

const MemberDashboard = () => {
  return (
    <>
      <Title
        title='Member Dashboard'
        description='Dashboard for the member of the SGGSS Medical Fund'
      />
      <MembersContainer />
    </>
  );
};
export default MemberDashboard;
