import apiClient from '../config/appClient';
import { tokenStorage } from '../storage/tokenStorage';

export interface LoginUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: {
    _id: string;
    roleCode: string;
    name: string;
    basePath: string;
  };
  status: string;
  mustChangePassword: boolean;
}

interface LoginApiResponse {
  success?: boolean;
  sucess?: boolean;
  statusCode?: number;
  statuscode?: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: LoginUser;
  };
}

export interface ChangeFirstLoginPasswordPayload {
  newPassword: string;
  confirmPassword: string;
}

interface ChangeFirstLoginPasswordResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    mustChangePassword: boolean;
  };
}

export const login = async (
  email: string,
  password: string
): Promise<LoginUser> => {
  const response = await apiClient.post<LoginApiResponse>(
    "/auth/login",
    {
      email: email.trim().toLowerCase(),
      password,
    }
  );

  const { accessToken, refreshToken, user } = response.data.data; // ← data.data

  await tokenStorage.saveTokens(accessToken, refreshToken);

  return user;
};

export const changeFirstLoginPassword = async (
  payload: ChangeFirstLoginPasswordPayload
): Promise<ChangeFirstLoginPasswordResponse> => {
  const response =
    await apiClient.put<ChangeFirstLoginPasswordResponse>(
      "/auth/first-login/change-password",
      payload
    );

  return response.data;
};

export const logout = async (): Promise<void> => {
  await tokenStorage.clear();
};