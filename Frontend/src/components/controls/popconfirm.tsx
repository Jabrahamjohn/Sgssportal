import { Popconfirm as AntdPopconfirm } from 'antd';

import type { PopconfirmProps } from 'antd';

type PopconfirmType = PopconfirmProps;

export default function Popconfirm(props: PopconfirmType) {
	return <AntdPopconfirm {...props} />;
}
