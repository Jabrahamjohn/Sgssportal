import { Empty as AntdEmpty } from 'antd';

import type { EmptyProps } from 'antd';

type EmptyType = EmptyProps;

function Empty(props: EmptyType) {
	return (
		<AntdEmpty
			imageStyle={{
				height: '50px',
				width: '50px',
				marginLeft: 'auto',
				marginRight: 'auto',
			}}
			{...props}
		/>
	);
}

export default Empty;
