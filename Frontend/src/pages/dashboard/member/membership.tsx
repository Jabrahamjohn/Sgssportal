import MembershipContainer from '~/containers/dashboard/member/membership';
import { Title } from '~/utils/components';

const MembershipPage = () => {
  return (
    <>
      <Title title='Membership' description="Member's memberships details" />
      <MembershipContainer />
    </>
  );
};
export default MembershipPage;
