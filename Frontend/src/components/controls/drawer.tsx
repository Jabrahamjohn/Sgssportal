import { CloseOutlined } from '@ant-design/icons';
import { Drawer as AntdDrawer } from 'antd';
import React from 'react';

import type { DrawerProps } from 'antd';

type DrawerType = DrawerProps & {
	drawerCloseIcon?: boolean;
	drawerTitle?: string;
};

function Drawer({
	children,
	drawerCloseIcon = true,
	drawerTitle,
	...props
}: DrawerType) {
	const compItems = React.useMemo(() => {
		const items: Record<string, any> = {};
		if (drawerTitle) {
			items.title = <span>{drawerTitle}</span>;
		}
		return items;
	}, [drawerTitle]);

	return (
		<AntdDrawer
			closeIcon={drawerCloseIcon ? <CloseOutlined /> : undefined}
			{...compItems}
			{...props}
		>
			{children}
		</AntdDrawer>
	);
}

export default Drawer;
