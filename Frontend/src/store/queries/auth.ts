import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as AuthService from '~/server/services/auth.service';
import type { LoginRequestDataType, LoginResponseType, LogoutResponseType, MutationOptionsType } from '~/types';
import { AppError } from '~/utils/errors';

import { useAuthContext, useUserContext } from '../contexts';
import tags from '../tags';

// ****** Queries ******

// get auth status
export function useGetAuthQuery({ initialData }: { initialData?: LoginResponseType }) {
  const query = useQuery<LoginResponseType>({
    queryKey: [tags.Auth],
    async queryFn() {
      return AuthService.getAuth();
    },
    initialData,
    retry: false,
  });

  return query;
}

// ****** Mutations ******

// login
export function useLoginMutation(options: MutationOptionsType<LoginResponseType['data']>) {
  const { csrfToken } = useAuthContext();
  const mutation = useMutation({
    async mutationFn(data: LoginRequestDataType) {
      if (!csrfToken) throw new AppError(500, 'CSRF Token is required');
      return AuthService.login({ csrfToken, data });
    },
    onSuccess(response) {
      options.onSuccess(response);
    },
  });

  return mutation;
}

// logout
export function useLogoutMutation(options: MutationOptionsType<LogoutResponseType['data']>) {
  const queryClient = useQueryClient();

  const { csrfToken, token } = useUserContext();

  const mutation = useMutation({
    async mutationFn() {
      return AuthService.logout({ csrfToken, token });
    },
    onSuccess(response) {
      queryClient.clear();
      options.onSuccess(response);
    },
  });

  return mutation;
}
