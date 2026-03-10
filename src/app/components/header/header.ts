import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "../../services/user-service";

@Component({
    selector: 'app-header',
    templateUrl: './header.html',
    styleUrls: ['./header.scss']
})
export class HeaderComponent {

    router = inject(Router);

    constructor(private userService: UserService) { }

    getUserId() { return this.userService.getUserId(); }

    isLoggedIn() { return this.userService.isLoggedIn(); }

    logout() { 
        
        this.userService.logout();
        this.router.navigate(['/']);
    }
}