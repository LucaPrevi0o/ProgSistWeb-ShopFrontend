import { PaymentMethod } from "./payment";

export interface User {

    id: number;
    email: string;
    password: string;
    token: string;
    info?: UserInfo;
}

export interface UserInfo {
    
    firstName: string;
    lastName: string;
    phone: string;
    address: Address;
    paymentMethods?: PaymentMethod[];
}

export interface Address {

    street: string;
    city: string;
    postalCode: string;
    country: string;
}