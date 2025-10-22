import { useLocation } from 'react-router-dom';

/**
 * Custom hook to extract the current `pathname` from the React Router location object.
 *
 * @returns An object containing the current `pathname`.
 *
 * @example
 * const { pathname } = usePathname();
 * console.log(pathname); // "/dashboard"
 */
export default function usePathname() {
  const { pathname } = useLocation();

  return { pathname };
}
