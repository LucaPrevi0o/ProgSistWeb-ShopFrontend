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
        if (!user.userInfo) return '—';

        const data = user.userInfo.data;
        const name = [data?.firstName, data?.lastName].filter(Boolean).join(' ');

        return name || '—';
    }
}
