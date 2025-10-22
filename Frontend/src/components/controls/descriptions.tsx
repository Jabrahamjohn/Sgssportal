import { Descriptions as AntdDescriptions, type DescriptionsProps } from 'antd';
import React from 'react';

import type { DescriptionsItemProps } from 'antd/es/descriptions/Item';

export type DescriptionsType = DescriptionsProps & {
	description?: React.ReactNode;
	title?: React.ReactNode;
	descriptions?: (Omit<DescriptionsItemProps, 'children'> & {
		key: string;
		title: string;
		value: React.ReactNode;
	})[];
};

function Descriptions({
	descriptions = [],
	title,
	description,
	...props
}: DescriptionsType) {
	return (
		<AntdDescriptions
			bordered
			column={1}
			layout="horizontal"
			contentStyle={{
				paddingRight: '1rem',
			}}
			// column={2}
			// layout="vertical"
			items={descriptions.map(({ value, key, title, ...descriptionProps }) => {
				return {
					key: key,
					label: title,
					children: value,
					...descriptionProps,
				};
			})}
			title={
				title || description ? (
					<>
						{title && (
							<h3 className="text-gray-600 capitalize text-sm leading-6 font-medium">
								{title}
							</h3>
						)}
						{description && (
							<p className="font-normal mt-1 max-w-2xl text-sm text-gray-500">
								{description}
							</p>
						)}
					</>
				) : undefined
			}
			{...props}
		/>
	);
}

export default Descriptions;
