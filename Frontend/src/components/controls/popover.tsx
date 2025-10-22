import { Popover as AntdPopover } from 'antd';

import type { PopoverProps } from 'antd';

type PopoverType = PopoverProps;

export default function Popover(props: PopoverType) {
	return <AntdPopover trigger={'click'} {...props} />;
}
