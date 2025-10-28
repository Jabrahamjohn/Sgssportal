import NewClaimContainer from '~/containers/dashboard/member/claims-new';
import { Title } from '~/utils/components';

const NewClaim = () => {
  return (
    <>
      <Title
        title='New Claim Request'
        description='Request new claim from the SGSS Medical Fund'
      />
      <NewClaimContainer />
    </>
  );
};
export default NewClaim;
