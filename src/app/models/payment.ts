export interface PaymentMethod<T = CreditCard | PayPal> {

    type: string;
    details: T;
}

export interface CreditCard {

    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    cardholderName: string;
}

export interface PayPal { email: string; }