import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "~/config/api";
import type {
  LoginRequestDataType,
  LoginResponseType,
  LogoutResponseType,
  MutationOptionsType,
} from "~/types";
import { AppError } from "~/utils/errors";

import { useAuthContext } from "../contexts";
import tags from "../tags";

// ****** Queries ******

// get auth status
export function useGetAuthQuery({
  initialData,
}: {
  initialData?: LoginResponseType;
}) {
  const query = useQuery<LoginResponseType>({
    queryKey: [tags.Auth],
    async queryFn() {
      const { data } = await api.get("auth/me/");
      return data;
    },
    initialData,
    retry: false,
  });

  return query;
}

// ****** Mutations ******

// login
export function useLoginMutation(
  options: MutationOptionsType<LoginResponseType>
) {
  const { csrfToken } = useAuthContext();
  const mutation = useMutation({
    async mutationFn(data: LoginRequestDataType) {
      if (!csrfToken) throw new AppError(500, "CSRF Token is required");
      const { data: responseData } = await api.post("auth/login/", data);
      return responseData;
    },
    onSuccess(response) {
      options.onSuccess(response);
    },
  });

  return mutation;
}

// logout
export function useLogoutMutation(
  options: MutationOptionsType<LogoutResponseType>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    async mutationFn() {
      const { data } = await api.post("auth/logout/");
      return data;
    },
    onSuccess(response) {
      queryClient.clear();
      options.onSuccess(response);
    },
  });

  return mutation;
}
