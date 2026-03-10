import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_BASE_URL } from "../app.config";
import { User } from "../models/user";
import { Observable } from "rxjs";
import { tap } from 'rxjs/operators';

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
        return this.http.get<User>(API_BASE_URL + '/users/' + userId);
    }
}