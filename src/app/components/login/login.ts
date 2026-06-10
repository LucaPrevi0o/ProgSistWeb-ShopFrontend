import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { UserService } from "../../services/user-service";
import { User } from "../../models/user";
import { Observable, of, tap } from "rxjs";
import { HttpState, toHttpState } from "../../app.config";
import { AsyncPipe } from "@angular/common";
import { Router } from "@angular/router";

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    imports: [AsyncPipe, ReactiveFormsModule],
    styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {

    loginForm: FormGroup;
    state$! : Observable<HttpState<User>>;
    router = inject(Router);

    constructor(private fb: FormBuilder, private userService: UserService) {

        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    ngOnInit() : void { 
        
        if (this.userService.isLoggedIn()) this.userService.logout();
        this.reset();
    }

    submit() : void {

        if (this.loginForm.invalid) return;

        const login = this.userService.login(this.loginForm.value as User);

        this.state$ = toHttpState(login).pipe(
            tap(state => {
                if (state.status === 'success') {
                    const destination = state.data.role === 'ADMIN'
                        ? '/admin'
                        : '/products';

                    this.router.navigate([destination]);
                }
            })
        );
    }

    reset() : void { this.state$ = of({ status: 'empty' } as HttpState<User>); }
}