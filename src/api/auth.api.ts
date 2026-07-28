import axios from "axios";
import api from "@/axios/api.axios";
import type {
  AdminLoginResponse,
  AdminUser,
  LoginRequest,
  LoginResponse,
} from "@/interface/auth.interface";

const authError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    return new Error(typeof detail === "string" ? detail : fallback);
  }
  return error instanceof Error ? error : new Error(fallback);
};

export const loginUser = async (
  data: LoginRequest
): Promise<AdminLoginResponse> => {
  try {
    const tokenResponse = await api.post<LoginResponse>(
      "/auth/jwt/create/",
      data
    );
    const userResponse = await api.get<AdminUser>("/auth/users/me/", {
      headers: {
        Authorization: `Bearer ${tokenResponse.data.access}`,
      },
    });

    if (!userResponse.data.is_staff) {
      throw new Error("This account does not have dashboard access.");
    }

    return { ...tokenResponse.data, user: userResponse.data };
  } catch (error) {
    throw authError(error, "Unable to sign in.");
  }
};

export const getCurrentUser = async (): Promise<AdminUser> => {
  try {
    const response = await api.get<AdminUser>("/auth/users/me/");
    return response.data;
  } catch (error) {
    throw authError(error, "Unable to verify this account.");
  }
};

export const logoutUser = async (accessToken: string): Promise<void> => {
  await api.post(
    "/auth/logout/",
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};
