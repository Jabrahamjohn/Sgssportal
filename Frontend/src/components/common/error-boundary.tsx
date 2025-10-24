// Frontend/src/components/common/error-boundary.tsx
import React from 'react';

import { AppImage, Button, Link } from '../../components/controls';
import { APP_NAME, LOGO_IMAGE } from '../../config';

interface Props {
	children: React.ReactNode;
	fallback?: React.ComponentType<{ message: string }>;
}

interface State {
	hasError: boolean;
	message: string;
}

class ErrorBoundary extends React.Component<Props, State> {
	state: State = {
		hasError: false,
		message: '',
	};

	static getDerivedStateFromError() {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// logErrorToMyService(error, errorInfo.componentStack);
		this.setState({ message: error.message });
		console.error('Uncaught Error: ', error, errorInfo);
	}

	render() {
		const message =
			this.state.message || 'Sorry, an unexpected error occurred!';
		const Fallback = this.props.fallback;
		if (this.state.hasError) {
			return Fallback ? (
				<Fallback message={message} />
			) : (
				<div className="container flex flex-col justify-between min-h-screen mx-auto p-4">
					<div className="h-[21px] w-[120px] md:h-[48px] md:w-[282px]">
						<AppImage
							className="h-full w-full md:hidden"
							src={LOGO_IMAGE}
							alt={APP_NAME}
						/>
						<AppImage
							className="hidden h-full w-full md:block"
							src={LOGO_IMAGE}
							alt={APP_NAME}
						/>
					</div>
					<div className="flex flex-col items-center justify-center relative bottom-14 w-full">
						<h1 className="font-black my-3 text-primary-600 text-4xl tracking-wide sm:text-5xl md:text-6xl lg:text-7xl">
							Oops!
						</h1>
						<p className="font-medium my-3 text-center text-secondary-500 text-sm md:text-base">
							{message}
						</p>
						<Link to="/">
							<Button>Go Back Home</Button>
						</Link>
					</div>
					<div className="text-center mt-20">⚠️ Something went wrong. Please reload.</div>
				</div>
			);
		}
		return this.props.children;
	}
}

export default ErrorBoundary;
