export interface KpiMetrics {
  totalUnitsSold?: number;
  totalAmount?: number;
  totalDiscount?: number;
  salesRecords?: number;
  discountRecords?: number;
}

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
    gender: string;
    age: number;
    customerRegion: string;
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

export interface TransactionsApiResponse {
  success: true;
  data: TransactionResponse[];
  metrics: KpiMetrics;
  pagination: PaginationResponse;
  sort: SortResponse;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string;
}
