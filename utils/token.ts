import AsyncStorage from "@react-native-async-storage/async-storage";

export const TokenKeys = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
};

export const TokenService = {
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TokenKeys.AUTH_TOKEN);
  },

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TokenKeys.AUTH_TOKEN, token);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TokenKeys.AUTH_TOKEN);
  },

  async getUserData<T>(): Promise<T | null> {
    const userData = await AsyncStorage.getItem(TokenKeys.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  async setUserData<T>(data: T): Promise<void> {
    await AsyncStorage.setItem(TokenKeys.USER_DATA, JSON.stringify(data));
  },

  async removeUserData(): Promise<void> {
    await AsyncStorage.removeItem(TokenKeys.USER_DATA);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([TokenKeys.AUTH_TOKEN, TokenKeys.USER_DATA]);
  },
};
