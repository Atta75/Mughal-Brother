
export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  SALESMAN = 'SALESMAN'
}

export enum TransactionType {
  SALE_RETAIL = 'SALE_RETAIL',
  SALE_WHOLESALE = 'SALE_WHOLESALE',
  PURCHASE = 'PURCHASE',
  RETURN = 'RETURN',
  EXPENSE = 'EXPENSE'
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
  minStock: number;
}

export interface Party {
  id: string;
  name: string;
  type: 'CUSTOMER' | 'SUPPLIER';
  subType: 'RETAIL' | 'WHOLESALE';
  phone: string;
  balance: number; // Positive = Receivable, Negative = Payable
}

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  items: TransactionItem[];
  subTotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  balance: number;
  partyId?: string;
  notes?: string;
  dueDate?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface LoginEvent {
  id: string;
  userName: string;
  role: UserRole;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  ipAddress?: string;
}

export interface AppState {
  currentUser: {
    id: string;
    name: string;
    role: UserRole;
  };
  products: Product[];
  parties: Party[];
  transactions: Transaction[];
  expenses: Expense[];
  loginLogs: LoginEvent[];
}
