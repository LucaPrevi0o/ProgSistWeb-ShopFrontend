import { Component, inject, OnInit } from "@angular/core";
import { Observable, switchMap, tap } from "rxjs";
import { HttpState, toHttpState} from "../../app.config";
import { Router } from "@angular/router";
import { AsyncPipe, JsonPipe } from "@angular/common";
import { User } from "../../models/user";
import { UserService } from "../../services/user-service";
import { LoginRedirectorComponent } from "../login-redirector/login-redirector";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [AsyncPipe, LoginRedirectorComponent, ReactiveFormsModule],
    templateUrl: './profile.html',
    styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {

    state$!: Observable<HttpState<User>>;
    router = inject(Router);

    profileForm!: FormGroup;
    editMode: boolean = false;

    constructor(private userService: UserService, private fb: FormBuilder) {

        this.profileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            phone: ['', Validators.required],
            street: ['', Validators.required],
            city: ['', Validators.required],
            postalCode: ['', Validators.required],
            country: ['', Validators.required]
        });
    }

    ngOnInit() : void { this.state$ = toHttpState(this.userService.getUser()); }

    goToLogin() : void { this.router.navigate(['/login']); }

    logout() : void { 
        
        this.userService.logout();
        this.router.navigate(['/login']);
    }

    startEdit(user?: User) : void {

        this.editMode = true;

        const info = user?.info;
        const addr = info?.address;

        this.profileForm.patchValue({
            firstName: info?.firstName ?? '',
            lastName: info?.lastName ?? '',
            phone: info?.phone ?? '',
            street: addr?.street ?? '',
            city: addr?.city ?? '',
            postalCode: addr?.postalCode ?? '',
            country: addr?.country ?? ''
        });
    }

    saveInfo() : void {

        if (this.profileForm.invalid) return;

        const userIdStr = this.userService.getUserId();
        if (!userIdStr) { this.goToLogin(); return; }
        const userId = Number(userIdStr);

        const v = this.profileForm.value;
        const info: Partial<User['info']> = {
            firstName: v.firstName,
            lastName: v.lastName,
            phone: v.phone,
            address: {
                street: v.street,
                city: v.city,
                postalCode: v.postalCode,
                country: v.country
            }
        };

        this.state$ = toHttpState(
            this.userService.updateUserInfo(userId, info).pipe(
                switchMap(() => this.userService.getUser()),
                tap(() => {
                    this.editMode = false;
                    this.profileForm.markAsPristine();
                    this.profileForm.markAsUntouched();
                })
            )
        );
    }

    cancelEdit() : void {
        this.editMode = false;
        this.profileForm.reset();
    }
}