// Frontend/src/server/services/member.service.ts
import api from "~/config/api";

export const getMemberMe = () => api.get("members/me/");
export const listMyClaims = (params?: any) => api.get("claims/", { params });
