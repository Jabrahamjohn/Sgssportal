import { CSRF_TOKEN } from '~/config';
import type { LoginRequestDataType, LoginResponseType, LogoutResponseType, ResponseType } from '~/types';
import { AppError, handleAllErrors } from '~/utils/errors';
import HttpInstance from '~/utils/http';
import * as AuthSerializer from '../serializers/auth.serializer';
import { saveCredentials } from '../utils/auth';
import { NewSuccessDataResponse } from '../utils/response';

export async function getAuth(): Promise<LoginResponseType> {
  const response = await HttpInstance.current().get<LoginResponseType>('/api/auth/user');
  const responseData = response.data;

  // Get the CSRF_TOKEN FROM THE HEADERS
  let csrfToken = responseData.data.csrfToken;
  if (!csrfToken && typeof response.headers.get === 'function' && response.headers.get(CSRF_TOKEN) !== undefined) {
    csrfToken = response.headers.get(CSRF_TOKEN)?.toString() || '';
  }
  const BROWSER_REFRESHED_KEY = 'browser_refreshed';
  if (!csrfToken) {
    // Check if the refreshed is in the session storage
    if (sessionStorage.getItem(BROWSER_REFRESHED_KEY)) {
      // Remove it and throw an error. Something must have gone wrong that may have prevented the token from being re-generated
      throw new AppError(400, 'CSRF TOKEN was not provided');
    }
    // Refresh the browser
    sessionStorage.setItem(BROWSER_REFRESHED_KEY, 'true');
    window.location.href = window.location.href.toString();
  }

  sessionStorage.removeItem(BROWSER_REFRESHED_KEY); // Remove the key if the browser already refreshed
  const result = { ...responseData.data, csrfToken };

  return NewSuccessDataResponse(result, responseData.message);
}

export async function login({
  csrfToken,
  data,
}: {
  csrfToken: string;
  data: LoginRequestDataType;
}): Promise<LoginResponseType> {
  const credentials = AuthSerializer.serializeLogin({
    token: 'token',
    data: {
      ...data,
      id: 1,
      firstname: 'Adam',
      middlename: 'Garden',
      lastname: 'Eve',
      fullname: 'Adam Garden Eve',
      phone: '08123456789',
      photo: null,
      gender: 'male',
    },
    duration: 48,
    success: true,
    message: 'Logged in',
  });

  let result: LoginResponseType | undefined = undefined;

  try {
    // Save credentials to the express server side cookies
    result = await saveCredentials(csrfToken, credentials);
  } catch (err) {
    const error = handleAllErrors(err);
    if (error.errorCode === 'ERROR_CSRF_100') {
      // Refresh the browser
      window.location.href = window.location.href.toString();
    } else {
      throw err;
    }
  }

  if (!result) throw new AppError(500, 'Unable to Sign In');

  return NewSuccessDataResponse(result.data);
}

export async function logout({ csrfToken, token }: { csrfToken: string; token: string }): Promise<LogoutResponseType> {
  try {
    const response = await HttpInstance.login(token, csrfToken).post<ResponseType>('/api/auth/logout/', {});
    const responseData = response.data;

    // Get the CSRF_TOKEN FROM THE HEADERS IF PROVIDED
    const newCsrfToken =
      typeof response.headers.get === 'function' ? response.headers.get(CSRF_TOKEN)?.toString() : undefined;

    return NewSuccessDataResponse({ csrfToken: newCsrfToken }, responseData.message);
  } catch (err) {
    const error = handleAllErrors(err);
    if (error.errorCode === 'ERROR_CSRF_100') {
      // Refresh the browser
      window.location.href = window.location.href.toString();
    }
    throw err;
  }
}
