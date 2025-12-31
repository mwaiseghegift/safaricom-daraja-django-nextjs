/**
 * API Client for Daraja Backend
 * Handles all HTTP requests to Django backend
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  STKPushRequest,
  STKPushResponse,
  STKPushQueryRequest,
  STKPushQueryResponse,
  B2CPaymentRequest,
  B2BPaymentRequest,
  C2BRegistrationRequest,
  Transaction,
  TransactionFilters,
  ApiError,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available (implement when auth is added)
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        // Handle common errors
        if (error.response) {
          // Server responded with error
          const apiError: ApiError = {
            error: error.response.data?.error || error.message,
            details: error.response.data?.details,
            code: error.response.status.toString(),
          };
          return Promise.reject(apiError);
        } else if (error.request) {
          // Request made but no response
          return Promise.reject({
            error: 'Network error. Please check your connection.',
            code: 'NETWORK_ERROR',
          });
        } else {
          // Something else happened
          return Promise.reject({
            error: error.message,
            code: 'UNKNOWN_ERROR',
          });
        }
      }
    );
  }

  // STK Push APIs
  async initiateSTKPush(data: STKPushRequest): Promise<STKPushResponse> {
    const response = await this.client.post<STKPushResponse>(
      '/api/mpesa/stk-push/',
      data
    );
    return response.data;
  }

  async querySTKPush(data: STKPushQueryRequest): Promise<STKPushQueryResponse> {
    const response = await this.client.post<STKPushQueryResponse>('/api/mpesa/stk-push/query/', data);
    return response.data;
  }

  // B2C Payment APIs
  async initiateB2CPayment(data: B2CPaymentRequest): Promise<any> {
    const response = await this.client.post('/api/mpesa/b2c/', data);
    return response.data;
  }

  // B2B Payment APIs
  async initiateB2BPayment(data: B2BPaymentRequest): Promise<any> {
    const response = await this.client.post('/api/mpesa/b2b/', data);
    return response.data;
  }

  // C2B APIs
  async registerC2BUrls(data: C2BRegistrationRequest): Promise<any> {
    const response = await this.client.post('/api/mpesa/c2b/register/', data);
    return response.data;
  }

  // Transaction APIs
  async getTransaction(transactionId: string): Promise<Transaction> {
    const response = await this.client.get<Transaction>(
      `/api/mpesa/transactions/${transactionId}/`
    );
    return response.data;
  }

  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    const response = await this.client.get<Transaction[]>(
      '/api/mpesa/transactions/',
      { params: filters }
    );
    return response.data;
  }

  // Reversal APIs
  async reverseTransaction(data: {
    transaction_id: string;
    amount: number;
    remarks?: string;
  }): Promise<any> {
    const response = await this.client.post('/api/mpesa/reversal/', data);
    return response.data;
  }

  // Account Balance APIs
  async queryAccountBalance(): Promise<any> {
    const response = await this.client.post('/api/mpesa/account-balance/');
    return response.data;
  }

  // Generic request method for custom endpoints
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export default ApiClient;
