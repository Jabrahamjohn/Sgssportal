import { Tabs as AntdTabs } from 'antd';

import type { TabsProps } from 'antd';

type TabsType = TabsProps;

function Tabs(props: TabsType) {
	return (
		<AntdTabs
			indicator={{ size: (origin) => origin + 30, align: 'center' }}
			{...props}
		/>
	);
}

export default Tabs;
