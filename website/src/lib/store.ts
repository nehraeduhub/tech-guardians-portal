import { apiGet, apiPost } from '@/lib/api';

// PDF store and payment settings (api/store.php) and orders (api/payments.php).

export interface StoreProduct {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  pages: number;
  format: string;
  price: number;
  offerPrice: number;
  cover: string;
  previews: string[];
  tags: string[];
  /** Admin only: private Google Drive link sent to buyers after payment. */
  driveLink?: string;
  visible?: boolean;
}

export interface PaymentSettings {
  delivery: 'approval' | 'instant';
  payeeName: string;
  upiId: string;
  qrImage: string;
  whatsapp: string;
  email: string;
  sheetUrl?: string;
  sheetSync?: boolean;
}

export interface Order {
  id: string;
  type: 'course' | 'pdf' | 'sheet';
  status: 'pending' | 'approved' | 'rejected' | 'recorded';
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  amount?: string;
  utr?: string;
  date?: string;
  received_at?: string;
  shot?: string;
  orderUrl?: string;
  productId?: string;
  source?: string;
  downloads?: number;
}

export interface SheetSyncStatus { at: number; ok?: boolean; rows?: number; added?: number; error?: string; enabled?: boolean }

export const loadStore = () => apiGet<{ products: StoreProduct[]; settings: PaymentSettings }>('store.php');
export const loadProduct = (id: string) => apiGet<{ product: StoreProduct; settings: PaymentSettings }>(`store.php?id=${encodeURIComponent(id)}`);
export const loadStoreAdmin = () => apiGet<{ products: StoreProduct[]; settings: PaymentSettings }>('store.php?action=admin');
export const saveStoreAdmin = (data: { products: StoreProduct[]; settings: PaymentSettings }) => apiPost('store.php?action=save', data);

export const loadOrders = () => apiGet<Order[]>('payments.php');
export const syncSheet = () => apiGet<SheetSyncStatus>('payments.php?action=sync');
export const sheetSyncStatus = () => apiGet<SheetSyncStatus>('payments.php?action=sync_status');
export const setOrderStatus = (id: string, status: 'pending' | 'approved' | 'rejected') => apiPost('payments.php?action=status', { id, status });
export const deleteOrder = (id: string) => apiPost('payments.php?action=delete', { id });

export const rupees = (n: number) => `₹${Number.isInteger(n) ? n : n.toFixed(2)}`;
export const salePrice = (p: StoreProduct) => (p.offerPrice > 0 ? p.offerPrice : p.price);
export const checkoutUrl = (p: StoreProduct) => `/courses/payment.html?product=${encodeURIComponent(p.id)}`;
