import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '@/config';

class ApiClient {
  private static instance: ApiClient;
  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: Config.API_URL,
    });

    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

export default ApiClient.getInstance().getAxiosInstance();
