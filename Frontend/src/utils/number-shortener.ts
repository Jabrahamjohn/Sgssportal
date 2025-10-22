function shortenNumber(value: number, precision = 2) {
	if (value >= 10 ** 12) {
		// Trillion
		return +(value / 10 ** 12).toPrecision(precision) + 'T';
	} else if (value >= 10 ** 9) {
		// Billion
		return +(value / 10 ** 9).toPrecision(precision) + 'B';
	} else if (value >= 10 ** 6) {
		// Million
		return +(value / 10 ** 6).toPrecision(precision) + 'M';
	} else if (value >= 10 ** 3) {
		// Thousands
		return +(value / 10 ** 3).toPrecision(precision) + 'K';
	}
	return value;
}

export default shortenNumber;
