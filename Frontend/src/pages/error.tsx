import React from 'react';
import {
	Link,
	useRouteError,
	useNavigate,
	isRouteErrorResponse,
} from 'react-router-dom';

import { DASHBOARD_PAGE } from '~/config/routes';

function ErrorPage() {
	const routeError = useRouteError();
	const navigate = useNavigate();

	const error = React.useMemo(() => {
		if (isRouteErrorResponse(routeError)) {
			return {
				title: 'Oops!',
				status: routeError.status,
				message: routeError.statusText,
			};
		} else {
			const err = routeError as any;
			return {
				title: err.title || 'Oops!',
				message:
					err.statusText ||
					err.message ||
					'Sorry, an unexpected error occurred!',
				status: err.status || 500,
			};
		}
	}, [routeError]);

	return (
		<main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
			<div className="text-center">
				<p className="text-lg font-semibold text-primary-600 md:text-3xl md:font-bold">
					{error.status}
				</p>
				<h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
					{error.title || 'Oops!'}
				</h1>
				<p className="mt-6 text-base leading-7 text-gray-600 md:text-lg">
					{error.message}
				</p>
				<div className="gap-6 mt-10 flex flex-col items-center justify-between sm:flex-row max-w-xs mx-auto">
					<span
						onClick={() => navigate(-1)}
						className="cursor-pointer rounded-md no-underline bg-primary-600 mx-2 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
					>
						Go back
					</span>
					<Link
						to={DASHBOARD_PAGE}
						className="cursor-pointer rounded-md no-underline bg-primary-600 mx-2 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
					>
						Go home
					</Link>
				</div>
			</div>
		</main>
	);
}

export default ErrorPage;
