import React from 'react';
import { useAuth } from '~/store/contexts/AuthContext';
import Layout from '../index';
import Dynamic from '../../utils/components/dynamic';
import SplashScreen from '../../utils/components/splash-screen';

const Authenticated = ({ children }: { children: React.ReactNode }) => {
	const { auth: isAuthenticated, loading: isLoading } = useAuth();

	if (isLoading === false && isAuthenticated)
		return (
			<Layout>
				{children}
			</Layout>
		);

	if (isLoading === false && isAuthenticated === false)
		return (
			<Dynamic
				fallback={<SplashScreen />}
				component={React.lazy(() => import('../../containers/auth/login'))}
			/>
		);

	throw {
		title: 'Internal Server Error.',
		status: 500,
		message: 'An error occurred. Please try again later.',
	};
};

export default Authenticated;
