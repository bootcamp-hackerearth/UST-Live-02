import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'hms_auth_token';

export const tokenStorage = {

  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

};