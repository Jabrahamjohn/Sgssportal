function formatPrice(
	data?: unknown,
	options: Record<string, string | number> = {}
) {
	const NairaFormatter = new Intl.NumberFormat('en-NG', {
		style: 'currency',
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
		currency: 'NGN',
		...options,
	});

	if (
		!data ||
		(typeof data !== 'number' && typeof data !== 'string') ||
		isNaN(+data)
	)
		return { price: '0.00', value: NairaFormatter.format(0) };

	const priceValue = data as string | number;

	if (typeof priceValue === 'string') {
		const parsedValue = parseFloat(priceValue.trim());
		if (isNaN(parsedValue))
			return { price: priceValue, value: NairaFormatter.format(0) };
	}

	const value =
		typeof priceValue === 'string' ? parseFloat(priceValue.trim()) : priceValue;

	return {
		price: value.toFixed(2),
		value: NairaFormatter.format(value),
	};
}

export default formatPrice;
