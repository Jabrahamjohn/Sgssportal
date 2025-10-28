import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as AuthService from '~/server/services/auth.service';
import type { MutationOptionsType } from '~/types';
// import type { LoginRequestDataType, LoginResponseType, LogoutResponseType, MutationOptionsType } from '~/types';
import { AppError } from '~/utils/errors';

import { useAuthContext, useUserContext } from '../contexts';
import tags from '../tags';

// ****** Queries ******

// get auth status
export function useGetAuthQuery({ initialData }: { initialData?: any }) {
  const query = useQuery<any>({
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
export function useLoginMutation(options: MutationOptionsType<any['data']>) {
  const { csrfToken } = useAuthContext();
  const mutation = useMutation({
    async mutationFn(data: any) {
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
export function useLogoutMutation(options: MutationOptionsType<any['data']>) {
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
