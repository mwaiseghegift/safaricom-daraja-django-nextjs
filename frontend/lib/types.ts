/**
 * TypeScript types for Daraja API
 */

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT';

export type TransactionType = 
  | 'STK_PUSH' 
  | 'B2C' 
  | 'B2B' 
  | 'C2B' 
  | 'REVERSAL' 
  | 'TRANSACTION_STATUS' 
  | 'ACCOUNT_BALANCE'
  | 'B2B_EXPRESS'
  | 'TAX_REMITTANCE';

export interface Transaction {
  id?: number;
  merchant_request_id?: string;
  checkout_request_id?: string;
  transaction_id?: string;
  conversation_id?: string;
  originator_conversation_id?: string;
  transaction_type: TransactionType;
  amount?: number;
  phone_number?: string;
  account_reference?: string;
  transaction_desc?: string;
  status: TransactionStatus;
  result_code?: number;
  result_desc?: string;
  request_payload?: any;
  response_payload?: any;
  callback_payload?: any;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export interface STKPushRequest {
  phone_number: string;
  amount: number;
  account_reference: string;
  transaction_desc?: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface STKPushQueryRequest {
  checkout_request_id: string;
}

export interface B2CPaymentRequest {
  phone_number: string;
  amount: number;
  command_id: 'SalaryPayment' | 'BusinessPayment' | 'PromotionPayment';
  remarks?: string;
  occasion?: string;
}

export interface B2BPaymentRequest {
  receiver_party: string;
  receiver_identifier_type: string;
  amount: number;
  account_reference: string;
  command_id: string;
  remarks?: string;
}

export interface C2BRegistrationRequest {
  validation_url?: string;
  confirmation_url?: string;
  response_type?: 'Completed' | 'Cancelled';
}

export interface TransactionFilters {
  status?: TransactionStatus;
  type?: TransactionType;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface DashboardStats {
  total_transactions: number;
  successful_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  total_amount: number;
  success_rate: number;
}

export interface RecentTransaction {
  id: number;
  type: TransactionType;
  amount: number;
  phone_number: string;
  status: TransactionStatus;
  created_at: string;
}

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
