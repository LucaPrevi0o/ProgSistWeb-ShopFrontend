// src/app/admin/users/admin-users.ts

import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpState, toHttpState } from '../../app.config';
import { AdminUser } from '../../models/user';
import { AdminService } from '../admin-service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [AsyncPipe],
    templateUrl: './admin-users.html',
    styleUrls: ['./admin-users.scss']
})
export class AdminUsersComponent {

    private adminService = inject(AdminService);

    usersState$: Observable<HttpState<AdminUser[]>> =
        toHttpState(this.adminService.getUsers());

    fullName(user: AdminUser): string {
        if (!user.info) return '—';

        const name = [
            user.info.firstName,
            user.info.lastName
        ].filter(Boolean).join(' ');

        return name || '—';
    }
}