import apiClient from '../config/appClient'
import { tokenStorage } from '../storage/tokenStorage';

export const login = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/patientLogin', {
    email: email.trim().toLowerCase(),
    password,
  });

  const { token, user } = response.data.data;

  // save token to device
  await tokenStorage.saveToken(token);

  return user;
};

export const logout = async () => {
  await tokenStorage.clear();
};