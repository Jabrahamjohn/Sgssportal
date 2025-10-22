import { Dropdown as AntdDropdown } from 'antd';

import type { DropDownProps } from 'antd';

export type DropdownType = DropDownProps;

function Dropdown({ children, ...props }: DropdownType) {
	return (
		<AntdDropdown trigger={['click']} {...props}>
			<span>{children}</span>
		</AntdDropdown>
	);
}

Dropdown.Button = AntdDropdown.Button;

export default Dropdown;
