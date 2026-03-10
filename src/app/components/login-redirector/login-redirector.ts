import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "../../services/user-service";

@Component({
    selector: 'app-login-redirector',
    templateUrl: './login-redirector.html',
    styleUrls: ['./login-redirector.scss'],
    imports: []
})
export class LoginRedirectorComponent {

    router = inject(Router);
    userService = inject(UserService);

    goToLogin() : void { this.router.navigate(['/login']); }
}