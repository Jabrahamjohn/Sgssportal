const message400 = 'Invalid data. Please try again!';
const message401 = 'Authentication credentials were not provided.';
const message403 = 'You are not authorized to continue this request.';
const message404 = 'A requested resource was not found!';
const message405 = 'Method not allowed.';
const message500 = 'A server error occurred! Please try again later.';

class AppError extends Error {
	message: string;
	status: number = 500;
	data;

	constructor(status: number = 500, message?: string, data?: any) {
		super(message);
		Object.setPrototypeOf(this, AppError.prototype);

		this.name = 'AppError';
		this.message = message
			? message
			: status === 400
			? message400
			: status === 401
			? message401
			: status === 403
			? message403
			: status === 404
			? message404
			: status === 405
			? message405
			: message500;
		this.status = status;
		this.data = data;
	}
}

export default AppError;
