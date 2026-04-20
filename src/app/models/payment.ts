export interface PaymentMethod<T = DebitCard | CreditCard | PayPal> {

    id: number;
    details: T;
}

export interface DebitCard {

    cardNumber: string;
    expiryDate: string;
    cvv: string;
}

export interface CreditCard {

    cardNumber: string;
    expiryDate: string;
    cvv: string;
    creditLimit: number;
}

export interface PayPal {

    email: string;
    password: string;
}