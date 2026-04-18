import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_BASE_URL } from "../app.config";
import { User } from "../models/user";
import { Observable } from "rxjs";
import { tap } from 'rxjs/operators';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
    
    http = inject(HttpClient);

    login(user: User) : Observable<User> {

        return this.http.post<User>(API_BASE_URL +'/login', { email: user.email, password: user.password })
            .pipe(
                tap(res => {
                    if (res?.token) localStorage.setItem('jwtToken', res.token);
                    if (res?.id) localStorage.setItem('userId', String(res.id));
                })
            );
    }

    getToken() : string | null { return localStorage.getItem('jwtToken'); }
    getUserId() : string | null { return localStorage.getItem('userId'); }    

    isLoggedIn() : boolean { return !!localStorage.getItem('jwtToken'); }

    logout() : void {
        
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userId');
    }

    getUser() : Observable<User> {
        
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error('User ID not found in local storage');
        return this.http.get<User>(API_BASE_URL + `/users/${userId}`);
    }

    updateUserInfo(userId: number, info: Partial<User['info']>) : Observable<User> {
        // Backend expects attributes either as top-level snake_case or nested under `info`.
        // Wrap the provided `info` object under `info` so the Rails controller can
        // read camelCase or snake_case fields from `params[:info]`.
        return this.http.patch<User>(API_BASE_URL + `/users/${userId}/info`, { info });
    }
}