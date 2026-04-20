export interface OrderItem {
    product_id: number;
    quantity: number;
}

export interface OrderPayload {
    order: {
        name: string;
        surname: string;
        address: string;
        city: string;
        postal_code: string;
        country: string;
        phone?: string;
        payment_method_id?: number | null;
        payment?: Record<string, unknown>;
        items: OrderItem[];
    };
}

export interface Order {
    id: number;
    status?: string;
    total?: number;
}
