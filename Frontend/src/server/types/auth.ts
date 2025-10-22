import type { ApiResponseType } from './base';

export type ApiLoginResponseType = ApiResponseType<{
  id: number;
  firstname: string;
  middlename: string | null;
  lastname: string;
  fullname: string;
  email: string;
  phone: string;
  photo: string | null;
  gender: string;
}> & {
  token: string;
  duration: number;
};
