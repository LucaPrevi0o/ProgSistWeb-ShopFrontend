import { PersonalData } from './user';
import { CartItem } from './cart';
import { PaymentMethod } from './payment';

export interface Order {

    personalData: PersonalData;
    items: CartItem[];
    paymentMethod: PaymentMethod;
    userId?: number | string;
}
