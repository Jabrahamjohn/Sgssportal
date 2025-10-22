import { CSRF_TOKEN } from '~/config/app';
import type { LoginResponseType, ServerLoginResponseType } from '~/types';
import HttpInstance from '~/utils/http';
import { NewSuccessDataResponse } from './response';

export async function saveCredentials(
  csrfToken: string,
  credentials: ServerLoginResponseType['data']
): Promise<LoginResponseType> {
  const response = await HttpInstance.csrf(csrfToken).post<ServerLoginResponseType>('/api/auth/login/', {
    credentials,
  });

  const responseData = response.data;

  // Get the CSRF_TOKEN FROM THE HEADERS IF PROVIDED
  const newCsrfToken =
    typeof response.headers.get === 'function' ? response.headers.get(CSRF_TOKEN)?.toString() : undefined;

  const result: LoginResponseType['data'] = { ...credentials, csrfToken: newCsrfToken || csrfToken };

  return NewSuccessDataResponse(result, responseData.message);
}
