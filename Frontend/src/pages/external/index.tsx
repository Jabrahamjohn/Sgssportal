import { APP_NAME } from '~/config/app';
import External from '~/containers/external/index';
import Title from '~/utils/components/title';

export default function Index() {
  return (
    <>
      <Title title={APP_NAME} description={`Welcome to ${APP_NAME}`} />
      <External />
    </>
  );
}
