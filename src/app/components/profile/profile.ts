import { Component, inject, OnInit } from "@angular/core";
import { Observable, take, switchMap } from "rxjs";
import { HttpState, toHttpState} from "../../app.config";
import { Router } from "@angular/router";
import { AsyncPipe, JsonPipe } from "@angular/common";
import { User } from "../../models/user";
import { UserService } from "../../services/user-service";
import { LoginRedirectorComponent } from "../login-redirector/login-redirector";
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [AsyncPipe, JsonPipe, LoginRedirectorComponent, ReactiveFormsModule],
    templateUrl: './profile.html',
    styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {

    state$!: Observable<HttpState<User>>;
    router = inject(Router);

    profileForm!: FormGroup;

    constructor(private userService: UserService, private fb: FormBuilder) {

        this.profileForm = this.fb.group({
            firstName: [''],
            lastName: [''],
            phone: ['']
        });
    }

    ngOnInit() : void { this.state$ = toHttpState(this.userService.getUser()); }

    goToLogin() : void { this.router.navigate(['/login']); }

    logout() : void { 
        
        this.userService.logout();
        this.router.navigate(['/login']);
    }

    saveInfo() : void {

        if (this.profileForm.invalid) return;

        const v = this.profileForm.value;

        // Decide create vs update by fetching current user once, then call the appropriate endpoint
        const op$ = this.userService.getUser().pipe(
            take(1),
            switchMap(user => {
                if (user?.info) {
                    return this.userService.updateUserInfo({ firstName: v.firstName, lastName: v.lastName, phone: v.phone });
                }
                return this.userService.createUserInfo({ firstName: v.firstName, lastName: v.lastName, phone: v.phone });
            }),
            switchMap(() => this.userService.getUser())
        );

        this.state$ = toHttpState(op$);
    }
}