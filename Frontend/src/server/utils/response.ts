import type { ResponseType } from '~/types';

type MessageResponseType = Omit<ResponseType, 'status'> & { status: 'success' };
type DataResponseType<T> = Omit<ResponseType, 'status' | 'data'> & { status: 'success'; data: T };

export function NewSuccessResponse(message: string): MessageResponseType {
  return {
    status: 'success' as const,
    message,
  };
}

export function NewSuccessDataResponse<T = unknown>(data: T, message: string = 'Success'): DataResponseType<T> {
  return {
    status: 'success' as const,
    message,
    data,
  };
}
