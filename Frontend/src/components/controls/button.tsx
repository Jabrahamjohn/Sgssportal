import { Button as AntdButton } from 'antd';
import React from 'react';

import type { ButtonProps } from 'antd';
import classNames from '../../utils/classnames';

export type ButtonType = Omit<ButtonProps, 'icon'> & {
	icon?: ({ className }: { className?: string }) => React.ReactNode;
	iconClass?: string;
};

function Button({
	className: propsClassName,
	icon: Icon,
	iconClass = '',
	...props
}: ButtonType) {
	const className = classNames('gap-1', propsClassName || '');

	const iconClassName = classNames('text-sm relative top-[1.5px', iconClass);
	return (
		<AntdButton
			icon={Icon ? <Icon className={iconClassName} /> : undefined}
			className={className}
			htmlType="submit"
			size="large"
			{...props}
		/>
	);
}

export default Button;
