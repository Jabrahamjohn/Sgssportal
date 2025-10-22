import { Breadcrumb as AntdBreadcrumb, type BreadcrumbProps } from 'antd';

import Link from './link';

export type BreadcrumbType = BreadcrumbProps;

function Breadcrumbs(props: BreadcrumbType) {
  return (
    <AntdBreadcrumb
      itemRender={itemRender}
      separator={
        <div className="flex justify-center h-full items-center px-1">
          <span className="bg-gray-400 block h-1.5 rounded-full w-1.5" />
        </div>
      }
      {...props}
    />
  );
}

const itemRender: BreadcrumbType['itemRender'] = (currentRoute, _, __, ___) => {
  return <Link to={currentRoute.href}>{currentRoute.title}</Link>;
  // const isLast = currentRoute?.path === items[items.length - 1]?.path;

  // return isLast ? (
  //   <span>{currentRoute.title}</span>
  // ) : (
  //   <Link to={`/${paths.join('/')}`}>{currentRoute.title}</Link>
  // );
};

export default Breadcrumbs;
