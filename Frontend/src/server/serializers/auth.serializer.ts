import type { ServerLoginResponseType } from '~/types';
import type { ApiLoginResponseType } from '../types';

export function serializeLogin(input: ApiLoginResponseType): ServerLoginResponseType['data'] {
  const data: ServerLoginResponseType['data'] = {
    token: input.token,
    user: input.data,
  };
  return data;
}
