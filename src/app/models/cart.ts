import { Product } from './product';
import { User } from './user';

export interface Cart {

    id: number;
    user: User;
    items: CartItem[];
}

export interface CartItem {

    product: Product;
    quantity: number;
}