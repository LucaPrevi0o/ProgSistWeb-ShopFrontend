export interface PaymentMethod<T = CreditCard | PayPal> {

    id?: number;
    methodType: string;
    details: T;
}

export interface CreditCard {

    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    cardHolderName: string;
}

export interface PayPal { email: string; }
