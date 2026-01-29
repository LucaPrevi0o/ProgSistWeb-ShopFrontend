import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { API_BASE_URL } from "../app.config";
import { User } from "../models/user";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class UserService {
    
    http = inject(HttpClient);

    login(user: User) : Observable<User> {
        return this.http.post<User>(API_BASE_URL +'/login', { email: user.email, password: user.password });
    }

    isLoggedIn() : boolean { return !!localStorage.getItem('jwtToken'); }

    logout() : void { localStorage.removeItem('jwtToken'); }
}