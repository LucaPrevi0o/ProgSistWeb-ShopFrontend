import { UserInfo } from './user';
import { CartItem } from './cart';

export interface Order {
    
    info: UserInfo;
    items: CartItem[];
    userId?: number | string;
}
