import { PersonalData } from './user';
import { CartItem } from './cart';
import { PaymentMethod } from './payment';

export interface OrderUser {
    id: number;
    email: string;
}

export interface Order {

    id?: number;
    personalData: PersonalData;
    items: CartItem[];
    paymentMethod: PaymentMethod;
    userId?: number | string;

    user?: OrderUser;      // admin-only
    total?: number;        // already useful elsewhere
    createdAt?: string;    // future sorting/filtering
}

export interface CheckoutResponse {
    orderId: number;
}
