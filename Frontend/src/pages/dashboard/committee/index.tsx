import CommitteeDashboardContainer from '~/containers/dashboard/committee';
import { Title } from '~/utils/components';

const CommitteeDashboard = () => {
  return (
    <>
      <Title
        title='Committee Dashboard'
        description='Dashboard for the committee of the SGGSS Medical Fund'
      />
      <CommitteeDashboardContainer />
    </>
  );
};
export default CommitteeDashboard;
