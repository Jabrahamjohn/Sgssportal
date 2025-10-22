import { useNavigate as useRouterNavigate } from 'react-router-dom';
import React from 'react';

/**
 * Custom hook that wraps React Router's `useNavigate` to provide
 * simplified `navigate` and `goBack` methods.
 *
 * @returns An object with:
 * - `navigate`: Function to navigate to a specific path
 * - `goBack`: Function to go back one step in history
 *
 * @example
 * const { navigate, goBack } = useNavigate();
 * navigate('/dashboard');
 * goBack();
 */
export default function useNavigate() {
  const routerNavigate = useRouterNavigate();

  const navigate = React.useCallback(
    (route: string) => {
      routerNavigate(route);
    },
    [routerNavigate]
  );

  const goBack = React.useCallback(() => {
    routerNavigate(-1);
  }, [routerNavigate]);

  return {
    navigate,
    goBack,
  };
}
