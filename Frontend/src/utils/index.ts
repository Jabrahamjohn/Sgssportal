export { default as classNames } from './classnames';
export { default as formatPrice } from './format-price';

export function capitalize(value?: string | number | null): string {
	if (!value) return ''; // Handle empty string or null/undefined input
	if (typeof value === 'number') return value.toString();
	return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function capitalizeAll(value?: string | number | null): string {
	const item = capitalize(value);
	const items = item.split(' ');
	const result = items.reduce((acc: string, item) => {
		return acc + ' ' + capitalize(item);
	}, '');
	return result;
}

export function generateRandomText(options?: { length?: number }) {
	const { length = 5 } = options || {};

	let result = '';
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

export function truncateText(
	text: string | number | null,
	options?: {
		maxLen?: number;
		startLen?: number;
		endLen?: number;
	}
) {
	if (!text) return '';
	const value = text.toString();
	return (
		value.length > (options?.maxLen || 15)
			? `${value.slice(0, options?.startLen || 6)}...${value.slice(
					value.length - (options?.endLen || 5),
					value.length
			  )}`
			: text
	).toString();
}

export function getImageUrl(value: string) {
	const result = value.replaceAll('\n', '');

	if (result.startsWith('http')) return result;

	return 'data:image/png;base64,' + value;
}

export function createURLSearchParams(
	params?: Record<string, string | number>,
	route: string = ''
) {
	const searchParams = new URLSearchParams(route);
	if (params) {
		Object.entries(params).forEach((entry) => {
			if (entry[1]) searchParams.set(entry[0], entry[1].toString());
		});
	}
	return searchParams.toString();
}

export * from './dates';
export * as dates from './dates';
