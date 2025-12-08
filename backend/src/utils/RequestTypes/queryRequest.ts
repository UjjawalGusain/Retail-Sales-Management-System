import { Gender, CustomerRegion } from "./../../../prisma/generated/client/enums";
export interface TransactionsQueryParams {
  page?: string;
  limit?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  gender?: Gender;
  customerRegion?: CustomerRegion;
  minAge?: string;
  maxAge?: string;
  customerNamePrefix?: string;
  phonePrefix?: string;
  productCategory?: string;
  tags?: string;
  orderBy?: 'customerName' | 'totalAmount' | 'date' | 'quantity';
  orderByType?: 'asc' | 'desc';
}
