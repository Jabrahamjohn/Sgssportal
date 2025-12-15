export * from './auth';
export * from './base';
export * from './files';

export type ResponseType<T = any> = {
  detail?: string
  data?: T
}

export type LoginRequestDataType = {
  username: string
  password: string
}

export type LoginResponseType = {
  id: string
  username: string
  email: string
  role: string
}

export type LogoutResponseType = {
  detail: string
}

export type ServerLoginResponseType = LoginResponseType

export type AuthDataType = LoginResponseType
