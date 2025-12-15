import React from "react";

import { useAuthContext } from "../../store/contexts";
import { useGetAuthQuery } from "../../store/queries/auth";
import { SplashScreen } from "../../utils/components";
import type { LoginResponseType } from "../../types";

export default function CheckAuth({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: LoginResponseType;
}) {
  const [loading, setLoading] = React.useState(true);

  const { login, logout } = useAuthContext();

  const {
    data: response,
    status,
    isLoading,
  } = useGetAuthQuery({
    initialData,
  });

  React.useEffect(() => {
    if (!isLoading) {
      if (status === "success" && response) {
        const csrfToken =
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrftoken="))
            ?.split("=")[1] || "";
        login({ user: response, csrfToken, token: "session" });
      } else logout();
      setLoading(false);
    }
  }, [login, logout, response, status, isLoading]);

  return loading ? <SplashScreen /> : children;
}
