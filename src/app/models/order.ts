import { PersonalData } from './user';
import { CartItem } from './cart';
import { PaymentMethod } from './payment';

export interface Order {

    info: PersonalData;
    items: CartItem[];
    paymentMethod: PaymentMethod;
    userId?: number | string;
}
