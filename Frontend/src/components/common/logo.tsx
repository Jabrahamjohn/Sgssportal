import { pageRoutes } from '~/config/routes';
import { Link } from '../controls';

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link
      to={pageRoutes.HOME_PAGE}
      className={`font-semibold text-lg ${className}`}
    >
      SGSS Medical Fund
    </Link>
  );
};
export default Logo;
