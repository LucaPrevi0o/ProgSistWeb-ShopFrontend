import { Component, inject } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { UserService } from "../../services/user-service";
import { User } from "../../models/user";
import { Observable, of, tap } from "rxjs";
import { HttpState, toHttpState } from "../../app.config";
import { AsyncPipe } from "@angular/common";
import { Router } from "@angular/router";

@Component({
    selector: 'app-register',
    templateUrl: './register.html',
    imports: [AsyncPipe, ReactiveFormsModule],
    styleUrls: ['./register.scss']
})
export class RegisterComponent {

    registerForm: FormGroup;
    state$! : Observable<HttpState<User>>;
    router = inject(Router);

    constructor(private fb: FormBuilder, private userService: UserService) {

        this.registerForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        });
        this.reset();
    }

    submit() : void {

        if (this.registerForm.invalid) return;

        const pwd = this.registerForm.get('password')?.value;
        const cpwd = this.registerForm.get('confirmPassword')?.value;
        if (pwd !== cpwd) { this.state$ = of({ status: 'error', code: 400 }); return; }

        const payload = { email: this.registerForm.get('email')?.value, password: pwd } as User;
        const call$ = this.userService.register(payload);

        this.state$ = toHttpState(call$).pipe(
            tap(state => { if (state.status === 'success') {
                localStorage.setItem('jwtToken', (state.data as any).token);
                const id = (state.data as any).id;
                if (id) this.router.navigate(['/users', id]);
                else this.router.navigate(['/products']);
            }})
        );
    }

    reset() : void { this.state$ = of({ status: 'empty' } as HttpState<User>); }
}
