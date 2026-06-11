import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_BASE_URL } from "../app.config";
import { User, UserInfo, UserRole } from "../models/user";
import { Observable } from "rxjs";
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
    
    http = inject(HttpClient);

    login(user: User) : Observable<User> {

        return this.http.post<User>(API_BASE_URL + '/auth/login', { email: user.email, password: user.password })
            .pipe(
                tap(res => this.storeAuthSession(res))
            );
    }

    register(user: User) : Observable<User> {

        return this.http.post<User>(API_BASE_URL + '/users', { email: user.email, password: user.password })
            .pipe(
                tap(res => this.storeAuthSession(res))
            );
    }

    getToken() : string | null { return localStorage.getItem('jwtToken'); }
    getUserId() : string | null { return localStorage.getItem('userId'); }
    getRole() : UserRole | null { return localStorage.getItem('userRole') as UserRole | null; }

    isLoggedIn() : boolean { return !!localStorage.getItem('jwtToken'); }
    isAdmin() : boolean { return this.getRole() === 'ADMIN'; }

    logout() : void {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
    }

    getUser() : Observable<User> {
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error('User ID not found in local storage');
        return this.http.get<User>(API_BASE_URL + `/users/${userId}`);
    }
    
    getCurrentUser(): Observable<User> {
        return this.http.get<User>(API_BASE_URL + '/auth/me');
    }

    logoutRemote(): Observable<void> {
        return this.http.post<void>(API_BASE_URL + '/auth/logout', {});
    }

    updateUserInfo(userId: number, info: Partial<UserInfo>) : Observable<User> {
        return this.http.patch<User>(API_BASE_URL + `/users/${userId}/user-info`, { userInfo: info });
    }

    private storeAuthSession(res: User): void {
        if (res?.token) localStorage.setItem('jwtToken', res.token);
        if (res?.id) localStorage.setItem('userId', String(res.id));
        if (res?.role) localStorage.setItem('userRole', res.role);
    }
}
