import React from 'react';

import {
  AuthContext,
  type AuthType,
  type ReducerActionType,
  type LoginPayloadType,
  type LogoutPayloadType,
} from './context';

function reducer(state: AuthType, action: ReducerActionType) {
  switch (action.type) {
    case 'login':
      return {
        auth: true,
        loading: false,
        csrfToken: action.payload.csrfToken,
        data: action.payload.user,
        token: action.payload.token,
      };
    case 'logout':
      return {
        auth: false,
        loading: false,
        data: state.data,
        csrfToken: action.payload?.csrfToken || state.csrfToken,
        token: null,
      };
    case 'change-csrf':
      return {
        ...state,
        csrfToken: action.payload,
      };
    default:
      return state;
  }
}

const initialState = {
  auth: false,
  csrfToken: null,
  data: null,
  loading: true,
  token: null,
};

const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const changeCSRFToken = React.useCallback(
    (token: string) => {
      dispatch({
        type: 'change-csrf',
        payload: token,
      });
    },
    [dispatch]
  );

  const login = React.useCallback(
    (payload: LoginPayloadType) => {
      dispatch({
        type: 'login',
        payload,
      });
    },
    [dispatch]
  );

  const logout = React.useCallback(
    (payload: LogoutPayloadType) => {
      dispatch({
        type: 'logout',
        payload,
      });
    },
    [dispatch]
  );

  return <AuthContext.Provider value={{ ...state, changeCSRFToken, login, logout }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
