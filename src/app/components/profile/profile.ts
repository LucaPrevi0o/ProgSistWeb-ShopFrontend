import { Component, inject, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { HttpState, toHttpState} from "../../app.config";
import { Router } from "@angular/router";
import { AsyncPipe } from "@angular/common";
import { User } from "../../models/user";
import { UserService } from "../../services/user-service";
import { LoginRedirectorComponent } from "../login-redirector/login-redirector";

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [AsyncPipe, LoginRedirectorComponent],
    templateUrl: './profile.html',
    styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {

    state$!: Observable<HttpState<User>>;
    router = inject(Router);

    constructor(private userService: UserService) {}

    ngOnInit() : void { this.state$ = toHttpState(this.userService.getUser()); }

    goToLogin() : void { this.router.navigate(['/login']); }

    logout() : void { 
        
        this.userService.logout();
        this.router.navigate(['/login']);
    }
}