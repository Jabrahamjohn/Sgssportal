import type { SortingFn } from '@tanstack/react-table';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const studentColumnSorter: SortingFn<any> = (rowA, rowB, _) => {
	const rowAValue =
		(rowA.original.firstname || '').trim() +
		' ' +
		(rowA.original.othernames || '').trim();
	const rowBValue =
		(rowB.original.firstname || '').trim() +
		' ' +
		(rowB.original.othernames || '').trim();

	// Implement your custom comparison logic
	// Example: Sort alphabetically ignoring case
	return rowAValue.toLowerCase().localeCompare(rowBValue.toLowerCase());
};

const sorters = {
	studentColumn: studentColumnSorter,
};

export default sorters;
