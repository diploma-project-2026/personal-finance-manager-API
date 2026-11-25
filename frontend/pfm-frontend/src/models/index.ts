export type Kind = "income" | "expense";
export interface Category {
  id: string;
  name: string;
  type: Kind;
}
export interface LineItem {
  name: string;
  quantity: number;
  price: number;
}
export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  categoryId: string;
  type: Kind;
  notes: string;
  items?: LineItem[];
}
export interface Budget {
  id: string;
  categoryId: string;
  month: string;
  limit: number;
}
export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
}
export interface Receipt {
  id: string;
  transactionId?: string;
  fileName: string;
  image: string;
  status: "PENDING_UPLOAD" | "UPLOADED" | "PROCESSING" | "DONE" | "FAILED";
  merchant: string;
  date: string;
  amount: number;
  categoryId: string;
  items: LineItem[];
}
export interface Data {
  currency: string;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  receipts: Receipt[];
}
export interface User {
  name: string;
  email: string;
}
export const today = () => new Date().toISOString().slice(0, 10);
export const money = (n: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(
    n,
  );
