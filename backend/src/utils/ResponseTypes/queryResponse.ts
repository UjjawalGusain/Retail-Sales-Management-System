import { Gender, CustomerRegion } from "./../../../prisma/generated/client/enums";

export interface TransactionResponse {
  transactionId: string;
  date: string;
  customerId: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  employeeName: string;
  customer: {
    customerName: string;
    phoneNumber: string;
    gender: Gender;
    age: number;
    customerRegion: CustomerRegion;
  };
  product: {
    productCategory: string;
  };
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  filters: Record<string, string | string[] | undefined>;
}



export interface SortResponse {
  orderBy: 'customerName' | 'totalAmount' | 'date' | 'quantity';
  orderByType: 'asc' | 'desc';
}


export interface LightTransactionsApiResponse {
  success: true;
  data: TransactionResponse[];
  pagination: PaginationResponse;
  sort: SortResponse;
}


export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string;
}
