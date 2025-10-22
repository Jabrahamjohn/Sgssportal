import { Link as RouterLink, type LinkProps } from 'react-router-dom';
import React from 'react';

type LinkType = Omit<LinkProps, 'to' | 'href' | 'className'> & {
	href?: string | null;
	to?: string | null;
	children?: React.ReactNode;
	className?: string;
};

function Link({ href, to, children, className, ...props }: LinkType) {
	return (
		<RouterLink className={className} to={to || href || '#'} {...props}>
			{children}
		</RouterLink>
	);
}

export default Link;
