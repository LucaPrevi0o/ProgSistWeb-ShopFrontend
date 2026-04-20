import { PaymentMethod, DebitCard, CreditCard, PayPal } from '../models/payment';
import { UserInfo } from '../models/user';

export function isPayPalDetails(d: any): d is PayPal {
    return d && typeof d === 'object' && 'email' in d && 'password' in d;
}

export function isDebitCardDetails(d: any): d is DebitCard {
    return d && typeof d === 'object' && 'cardNumber' in d && !('creditLimit' in d);
}

export function isCreditCardDetails(d: any): d is CreditCard {
    return d && typeof d === 'object' && 'cardNumber' in d && 'creditLimit' in d;
}

export function buildPaymentData(values: any, paymentMode: 'saved' | 'manual', selectedPaymentMethod: PaymentMethod | null, manualPaymentType: 'paypal' | 'debit_card' | 'credit_card' | null): Record<string, unknown> {
    const paymentData: Record<string, unknown> = {};

    if (paymentMode === 'saved' && selectedPaymentMethod) {
        const details: any = selectedPaymentMethod.details;
        if (isPayPalDetails(details)) {
            paymentData.type = 'paypal';
            paymentData.email = details.email;
            // don't copy saved passwords in plain UI — backend may use id
        } else if (isDebitCardDetails(details)) {
            paymentData.type = 'debit_card';
            paymentData.cardNumber = details.cardNumber;
            paymentData.expiryDate = details.expiryDate;
            paymentData.cvv = details.cvv;
        } else if (isCreditCardDetails(details)) {
            paymentData.type = 'credit_card';
            paymentData.cardNumber = details.cardNumber;
            paymentData.expiryDate = details.expiryDate;
            paymentData.cvv = details.cvv;
            paymentData.creditLimit = details.creditLimit;
        }

    } else if (paymentMode === 'manual' && manualPaymentType) {
        if (manualPaymentType === 'paypal') {
            paymentData.type = 'paypal';
            paymentData.email = values.paypalEmail;
            paymentData.password = values.paypalPassword;
        } else if (manualPaymentType === 'debit_card') {
            paymentData.type = 'debit_card';
            paymentData.cardNumber = values.cardNumber;
            paymentData.expiryDate = values.expiryDate;
            paymentData.cvv = values.cvv;
        } else if (manualPaymentType === 'credit_card') {
            paymentData.type = 'credit_card';
            paymentData.cardNumber = values.cardNumber;
            paymentData.expiryDate = values.expiryDate;
            paymentData.cvv = values.cvv;
            paymentData.creditLimit = values.creditLimit;
        }
    }

    return paymentData;
}

export function mapUserInfoToFormPatch(info?: UserInfo) {
    return {
        name: info?.firstName ?? '',
        surname: info?.lastName ?? '',
        phone: info?.phone ?? '',
        address: info?.address?.street ?? '',
        city: info?.address?.city ?? '',
        postal_code: info?.address?.postalCode ?? '',
        country: info?.address?.country ?? ''
    };
}

export function computeAutofilled(payload: Record<string, any>): Record<string, boolean> {
    const autofilled: Record<string, boolean> = {};
    Object.keys(payload).forEach(k => {
        const v = payload[k];
        if (v && v.toString().trim().length) autofilled[k] = true;
    });
    return autofilled;
}

export function maskCardNumber(cardNumber: string | undefined) {
    if (!cardNumber) return '';
    const s = String(cardNumber);
    const masked = s.slice(-4).padStart(s.length, '*');
    return masked;
}
