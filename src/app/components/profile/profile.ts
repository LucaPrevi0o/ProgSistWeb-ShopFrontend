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

    startEdit(user: User) : void {
        this.editMode = true;
        const info = user?.info;
        this.profileForm.setValue({
            firstName: info?.firstName ?? '',
            lastName: info?.lastName ?? '',
            phone: info?.phone ?? ''
        });
    }

    cancelEdit() : void {
        this.editMode = false;
        this.profileForm.reset({ firstName: '', lastName: '', phone: '' });
    }

    saveInfo() : void {
        if (this.profileForm.invalid) return;

        const v = this.profileForm.value;
        const op$ = (this.editMode ?
            this.userService.updateUserInfo({ firstName: v.firstName, lastName: v.lastName, phone: v.phone }) :
            this.userService.createUserInfo({ firstName: v.firstName, lastName: v.lastName, phone: v.phone })
        ).pipe(
            switchMap(() => this.userService.getUser())
        );

        const saveState$ = toHttpState(op$);
        this.state$ = saveState$;

        // when save completes successfully, exit edit mode
        saveState$.subscribe(s => {
            if ((s as any).status === 'success') {
                this.editMode = false;
            }
        });
    }
}