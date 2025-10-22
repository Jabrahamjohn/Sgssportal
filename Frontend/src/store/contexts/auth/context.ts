import React from 'react';

import type { AuthDataType } from '~/types';
import { AppError } from '~/utils/errors';

export type AuthContextType = AuthType & {
  changeCSRFToken: (token: string) => void;
  login: (data: LoginPayloadType) => void;
  logout: (data: LogoutPayloadType) => void;
};

export type AuthType = {
  data: AuthDataType | null;
  csrfToken: string | null;
  token: string | null;
  auth: boolean;
  loading: boolean;
};
export type ReducerActionType =
  | { type: 'logout'; payload: LogoutPayloadType }
  | { type: 'change-csrf'; payload: string }
  | { type: 'login'; payload: LoginPayloadType };
export type LoginPayloadType = { user: AuthDataType; csrfToken: string; token: string };
export type LogoutPayloadType = { csrfToken?: string } | void;

export const useAuthContext = () => {
  return React.useContext(AuthContext) as AuthContextType;
};

export const useUserContext = () => {
  const { csrfToken, data, token, ...context } = useAuthContext();
  if (!data || !token || !csrfToken) throw new AppError(401);

  return { ...context, user: data, csrfToken, data, token };
};

export const AuthContext = React.createContext<AuthContextType | null>(null);
