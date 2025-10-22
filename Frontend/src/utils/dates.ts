import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

type DateParamType = null | string | Date | number | dayjs.Dayjs;
type DateStringParamType = boolean | 'dayjs';
type DateReturnType = string | Date | dayjs.Dayjs;

dayjs.extend(duration);

export function getDate<ReturnType = DateReturnType>(
	passedDate?: DateParamType,
	str: DateStringParamType = false
) {
	let value: DateReturnType;
	const date = dayjs(passedDate);
	if (str === 'dayjs') value = date;
	else if (str === true) value = date.format('YYYY-MM-DD');
	else value = date.toDate();
	return value as ReturnType extends 'dayjs' ? dayjs.Dayjs : ReturnType;
}

export function getNextDate(
	passedDate?: DateParamType,
	nod = 1,
	str: DateStringParamType = false
) {
	// nod => no_of_days
	const date = getDate(passedDate, 'dayjs') as dayjs.Dayjs;
	const newDate = date.add(nod, 'day');

	return getDate(newDate, str);
}

export function getNoOfDays(start: DateParamType, end: DateParamType) {
	return dayjs(end).diff(start, 'day');
}

export function isEqualDate(start: DateParamType, end: DateParamType) {
	return dayjs(start).isSame(end, 'day');
}

export function isBeforeDate(start: DateParamType, end: DateParamType) {
	return dayjs(start).isBefore(end, 'day');
}

export function isAfterDate(start: DateParamType, end: DateParamType) {
	return dayjs(start).isAfter(end, 'day');
}

export function getFirstDateOfWeek(pdate: Date | string = new Date()) {
	const date = getDate(pdate, 'dayjs') as dayjs.Dayjs;
	const firstDate = date.startOf('week');
	return firstDate.toDate();
}

export function getLastDateOfWeek(pdate: Date | string = new Date()) {
	const date = getDate(pdate, 'dayjs') as dayjs.Dayjs;
	const endDate = date.endOf('week');
	return endDate.toDate();
}

export function getFirstDateOfMonth(pdate: Date | string = new Date()) {
	const date = getDate(pdate, 'dayjs') as dayjs.Dayjs;
	const firstDate = date.startOf('month');
	return firstDate.toDate();
}

export function getLastDateOfMonth(pdate: Date | string) {
	const date = getDate(pdate, 'dayjs') as dayjs.Dayjs;
	const endDate = date.endOf('month');
	return endDate.toDate();
}

export function getOffsetDate(_date?: Date | string | number, str = false) {
	const date = getDate(_date) as Date;
	const offset = date.getTimezoneOffset();
	const add = offset < 0;
	date.setMinutes(
		add
			? date.getMinutes() + Math.abs(offset)
			: date.getMinutes() - Math.abs(offset)
	);
	return getDate(date, str);
}

export function getStringedDate(date?: DateParamType) {
	return getDate(date, true) as string;
}

export function getStringTime(passedDate?: DateParamType) {
	const date = passedDate ? (getDate(passedDate, false) as Date) : new Date();
	const _hour = date.getHours();
	const hour = _hour === 0 ? 12 : _hour > 12 ? _hour - 12 : _hour;
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const suffix = _hour > 11 ? 'pm' : 'am';
	return `${hour}:${minutes} ${suffix.toUpperCase()}`;
}

export function getStringDateTime(_date?: Date | string) {
	const date = _date ? (getDate(_date, false) as Date) : new Date();
	return `${date.toDateString()}, ${getStringTime(date)}`;
}

export const getDateString = (
	_date?: Date,
	_type?: 'date' | 'day' | 'month' | 'year'
) => {
	const date = _date || new Date();
	const days = [
		'sunday',
		'monday',
		'tuesday',
		'wednesday',
		'thursday',
		'friday',
		'saturday',
		'sunday',
	];
	const months = [
		'january',
		'february',
		'march',
		'april',
		'may',
		'june',
		'july',
		'august',
		'september',
		'october',
		'november',
		'december',
	];

	switch (_type) {
		case 'date':
			return date.getDate();
		case 'day':
			return days[date.getDay()];
		case 'month':
			return months[date.getMonth()];
		case 'year':
			return date.getFullYear();
		default:
			return days[date.getDay()];
	}
};

/*

Return sunday in the specified week
const sunday = getWeekDate(new Date(), 0)

Return monday in the specified week
const monday = getWeekDate(new Date(), 1)

*/

export function getWeekDate(
	weekDate: Date | string = new Date(),
	day: number = 0
) {
	const aDay = 24 * 60 * 60 * 1000;
	const currentDate =
		typeof weekDate === 'string' ? new Date(weekDate) : weekDate;
	const weekDay = new Date(
		currentDate.getTime() - +(currentDate.getDay() - day) * aDay
	);
	weekDay.setHours(0, 0, 0, 0);
	return weekDay;
}

export function getDateNumberValue(value: number) {
	let num = value.toString();
	if (num.length < 13) num = num + '000';
	return parseInt(num);
}

export function getDuration(date: number) {
	return dayjs.duration(date);
}

export function formatDate(
	date: DateParamType,
	format: string = 'DD MMM, YYYY'
) {
	return dayjs(date).format(format);
}

export default getDate;
