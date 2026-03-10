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
}