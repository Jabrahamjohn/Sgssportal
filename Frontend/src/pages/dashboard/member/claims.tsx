import ClaimsListContainer from '~/containers/dashboard/member/claims';
import { Title } from '~/utils/components';

const ClaimsList = () => {
  return (
    <>
      <Title
        title='Claims'
        description='List of all the claims made by member'
      />
      <ClaimsListContainer />
    </>
  );
};
export default ClaimsList;
