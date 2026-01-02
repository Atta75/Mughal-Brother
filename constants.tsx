
import React from 'react';
import { UserRole, Product, Party, TransactionType } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', sku: 'SKU001', name: 'Premium Coffee Beans (1kg)', category: 'Grocery', costPrice: 1500, retailPrice: 2250, wholesalePrice: 1800, stock: 45, minStock: 10 },
  { id: '2', sku: 'SKU002', name: 'Organic Almond Milk (1L)', category: 'Dairy', costPrice: 350, retailPrice: 550, wholesalePrice: 480, stock: 120, minStock: 20 },
  { id: '3', sku: 'SKU003', name: 'Stainless Steel Whisk', category: 'Kitchen', costPrice: 450, retailPrice: 850, wholesalePrice: 650, stock: 15, minStock: 5 },
  { id: '4', sku: 'SKU004', name: 'Laundry Pods (30pk)', category: 'Cleaning', costPrice: 800, retailPrice: 1450, wholesalePrice: 1100, stock: 60, minStock: 15 },
  { id: '5', sku: 'SKU005', name: 'Whole Grain Sourdough', category: 'Bakery', costPrice: 200, retailPrice: 450, wholesalePrice: 350, stock: 8, minStock: 5 },
];

export const INITIAL_PARTIES: Party[] = [
  { id: 'c1', name: 'Walk-in Customer', type: 'CUSTOMER', subType: 'RETAIL', phone: '', balance: 0 },
  { id: 'c2', name: 'City Cafe Ltd', type: 'CUSTOMER', subType: 'WHOLESALE', phone: '555-0199', balance: 45000 },
  { id: 's1', name: 'Global Provisions Inc', type: 'SUPPLIER', subType: 'WHOLESALE', phone: '555-8822', balance: -120000 },
];

export const SCHEMA_DOCS = `
### Database Schema (Recommended)
1. **Users**: id (PK), name, email, password_hash, role (Enum)
2. **Products**: id (PK), sku (Unique), name, category_id (FK), cost_price, retail_price, wholesale_price, current_stock, min_stock_level
3. **Parties**: id (PK), name, contact_info, type (Customer/Supplier), category (Retail/Wholesale), balance
4. **Transactions**: id (PK), date, user_id (FK), party_id (FK, Nullable), type (Sale/Purchase/Return/Expense), subtotal, discount, total, paid_amount, balance_amount, status
5. **Transaction_Items**: id (PK), transaction_id (FK), product_id (FK), quantity, unit_price, line_total
6. **Ledgers**: id (PK), party_id (FK), transaction_id (FK), debit, credit, running_balance, date
7. **Expenses**: id (PK), category, amount, description, date, transaction_id (FK, Optional)

### API Structure (RESTful)
- **GET /products**: List products (Search, Filter)
- **POST /products**: Create new product
- **PUT /products/:id**: Update stock or pricing
- **GET /transactions**: History with pagination
- **POST /transactions**: Atomic operation (Update Stock + Update Ledger + Create Transaction)
- **GET /parties**: List customers/suppliers with balances
- **GET /reports/profit-loss**: Aggregate logic for P&L
`;
