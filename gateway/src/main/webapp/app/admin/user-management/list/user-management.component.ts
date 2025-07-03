import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { combineLatest } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, SortState, sortStateSignal } from 'app/shared/sort';
import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { SORT } from 'app/config/navigation.constants';
import { ItemCountComponent } from 'app/shared/pagination';
import { AccountService } from 'app/core/auth/account.service';
import { UserManagementService } from '../service/user-management.service';
import { User } from '../user-management.model';
import UserManagementDeleteDialogComponent from '../delete/user-management-delete-dialog.component';

@Component({
  selector: 'jhi-user-mgmt',
  templateUrl: './user-management.component.html',
  imports: [RouterModule, SharedModule, SortDirective, SortByDirective, ItemCountComponent],
})
export default class UserManagementComponent implements OnInit {
  currentAccount = inject(AccountService).trackCurrentAccount();
  users = signal<User[] | null>(null);
  isLoading = signal(false);
  totalItems = signal(0);
  itemsPerPage = ITEMS_PER_PAGE;
  page!: number;
  sortState = sortStateSignal({});

  private readonly userService = inject(UserManagementService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sortService = inject(SortService);
  private readonly modalService = inject(NgbModal);

  ngOnInit(): void {
    this.handleNavigation();
  }

  setActive(user: User, isActivated: boolean): void {
    this.userService.update({ ...user, activated: isActivated }).subscribe(() => this.loadAll());
  }

  trackIdentity(item: User): number {
    return item.id!;
  }

  deleteUser(user: User): void {
    const modalRef = this.modalService.open(UserManagementDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.user = user;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadAll();
      }
    });
  }

  loadAll(): void {
    this.isLoading.set(true);
    this.userService
      .query({
        page: this.page - 1,
        size: this.itemsPerPage,
        sort: this.sortService.buildSortParam(this.sortState(), 'id'),
      })
      .subscribe({
        next: (res: HttpResponse<User[]>) => {
          this.isLoading.set(false);
          this.onSuccess(res.body, res.headers);
        },
        error: () => this.isLoading.set(false),
      });
  }

  transition(sortState?: SortState): void {
    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute.parent,
      queryParams: {
        page: this.page,
        sort: this.sortService.buildSortParam(sortState ?? this.sortState()),
      },
    });
  }

  private handleNavigation(): void {
    combineLatest([this.activatedRoute.data, this.activatedRoute.queryParamMap]).subscribe(([data, params]) => {
      const page = params.get('page');
      this.page = +(page ?? 1);
      this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data.defaultSort));
      this.loadAll();
    });
  }

  private onSuccess(users: User[] | null, headers: HttpHeaders): void {
    this.totalItems.set(Number(headers.get('X-Total-Count')));
    this.users.set(users);
  }
}
