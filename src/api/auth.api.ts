import api from "@/axios/api.axios";
import type { LoginRequest, LoginResponse } from "@/interface/auth.interface";

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post("/auth/jwt/create/", data);
  return response.data;
};
