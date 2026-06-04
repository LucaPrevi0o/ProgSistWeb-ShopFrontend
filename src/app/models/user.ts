import { PaymentMethod } from './payment';

export type UserRole = 'USER' | 'ADMIN';

export interface User {

    id: number;
    email: string;
    password: string;
    token: string;
    role?: UserRole;
    info?: UserInfo
}

export interface UserInfo {
        
    data: PersonalData;
    paymentMethods: PaymentMethod[];
}

export interface PersonalData {
    
    firstName: string;
    lastName: string;
    phone: string;
    address: Address;
}

export interface Address {

    street: string;
    city: string;
    postalCode: string;
    country: string;
}
