import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "../../services/user-service";

@Component({
    selector: 'app-home',
    templateUrl: './home.html',
    styleUrls: ['./home.scss']
})
export class HomeComponent {

    router = inject(Router);
    userService = inject(UserService);

    isLoggedIn() : boolean { return this.userService.isLoggedIn(); }

    goProfile() : void {
        
        const userId = this.userService.getUserId();
        if (userId) this.router.navigate(['/users', userId]);
        else this.router.navigate(['/login']);
    }

    // Navigate to the register page (not implemented yet)
    goRegister() : void { this.router.navigate(['/register']); }

    // Navigate to the login page
    goLogin() : void { this.router.navigate(['/login']); }

    // Navigate to the product list
    goProducts() : void { this.router.navigate(['/products']); }
}