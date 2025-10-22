import { Button as AntdButton } from 'antd';
import React from 'react';

import type { ButtonProps } from 'antd';
import classNames from '../../utils/classnames';

export type ButtonType = Omit<ButtonProps, 'icon'> & {
	icon?: ({ className }: { className?: string }) => React.ReactNode;
};

function IconButton({
	children,
	className: propsClassName,
	icon: Icon,
	...props
}: ButtonType) {
	const className = classNames(
		'h-9 w-9 p-0 flex items-center justify-center rounded-full',
		propsClassName || ''
	);

	return (
		<AntdButton
			className={className}
			size="large"
			htmlType="button"
			type="default"
			{...props}
		>
			{Icon ? <Icon /> : children}
		</AntdButton>
	);
}

export default IconButton;
