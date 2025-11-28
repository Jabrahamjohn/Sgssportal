import { MoreOutlined } from '@ant-design/icons';
import React from 'react';

import Button, { type ButtonType } from '../controls/button';
import Dropdown, { type DropdownType } from '../controls/dropdown';
import IconButton, {
	type ButtonType as IconButtonType,
} from '../controls/icon-button';
import { Link } from "react-router-dom";

export type DropdownItemsType = DropdownType & {
	actions?: (ButtonType & {
		key: string;
		label: React.ReactNode;
		href?: string;
		renderButtonWrapper?: boolean;
		iconClass?: string;
	})[];
	component?: (props: IconButtonType) => React.ReactNode;
};

export default function DropdownItems({
	actions = [],
	component: ActionButton,
	...props
}: DropdownItemsType) {
	const menuItems = React.useMemo(() => {
		return actions.map(
			({
				key,
				label,
				href,
				renderButtonWrapper = true,
				iconClass = 'lg:mr-2',
				...props
			}) => {
				const className = 'dropdown-item-button';
				const labelClassName = 'dropdown-item-button-label';

				return {
					className: '!p-0',
					key,
					label: !renderButtonWrapper ? (
						label
					) : !href ? (
						<div>
							<Button
								block
								className={className}
								size="large"
								type="link"
								iconClass={iconClass}
								{...props}
							>
								<span className={labelClassName}>{label}</span>
							</Button>
						</div>
					) : (
						<Link to={href}>
							<Button
								block
								className={className}
								size="large"
								type="text"
								iconClass={iconClass}
								{...props}
							>
								<span className={labelClassName}>{label}</span>
							</Button>
						</Link>
					),
				};
			}
		);
	}, [actions]);

	return (
		<Dropdown menu={{ items: menuItems }} trigger={['click']} {...props}>
			{ActionButton ? (
				<ActionButton />
			) : (
				<IconButton icon={MoreOutlined} type="text" />
			)}
		</Dropdown>
	);
}
