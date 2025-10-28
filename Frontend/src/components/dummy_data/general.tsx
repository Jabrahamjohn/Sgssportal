import { pageRoutes } from '~/config/routes';
import { ImUser, ImUsers } from 'react-icons/im';
import { IoIosSettings } from 'react-icons/io';
import { BsJournalMedical } from 'react-icons/bs';
import { LuLayoutDashboard } from 'react-icons/lu';

export const nav_items = [
  { icon: LuLayoutDashboard, link: pageRoutes.MEMBERS, name: 'Dashboard' },
  {
    icon: BsJournalMedical,
    link: pageRoutes.MEMBERS_CLAIMS,
    name: 'Claims',
  },
  { icon: ImUser, link: pageRoutes.MEMBER_CHRONIC, name: 'Chronic' },
  {
    icon: IoIosSettings,
    link: pageRoutes.MEMBERSHIP,
    name: 'My Membership',
  },
  { icon: ImUsers, link: pageRoutes.COMMITTE, name: 'Committee' },
  { icon: ImUser, link: pageRoutes.ADMIN, name: 'Admin' },
  {
    icon: IoIosSettings,
    link: pageRoutes.ADMIN_SETTINGS,
    name: 'Settings',
  },
  //   { icon: UserOutlined, link: PROFILE_PAGE, name: 'Profile' },
];
