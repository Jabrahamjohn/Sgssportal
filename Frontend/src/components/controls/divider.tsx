import { Divider as AntdDivider } from 'antd';

import type { DividerProps } from 'antd';

type DividerType = DividerProps;

export default function Divider(props: DividerType) {
	return <AntdDivider {...props} />;
}
