import { AfterContentInit, ContentChild, Directive, Host, HostListener, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faSort, faSortDown, faSortUp, IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { SortDirective } from './sort.directive';

@Directive({
  selector: '[jhiSortBy]',
})
export class SortByDirective<T> implements AfterContentInit, OnDestroy {
  @Input() jhiSortBy!: T;

  @ContentChild(FaIconComponent, { static: false })
  iconComponent?: FaIconComponent;

  sortIcon = faSort;
  sortAscIcon = faSortUp;
  sortDescIcon = faSortDown;

  private readonly destroy$ = new Subject<void>();

  constructor(@Host() private sort: SortDirective<T>) {
    sort.predicateChange.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateIconDefinition());
    sort.ascendingChange.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateIconDefinition());
  }

  @HostListener('click')
  onClick(): void {
    if (this.iconComponent) {
      this.sort.sort(this.jhiSortBy);
    }
  }

  ngAfterContentInit(): void {
    this.updateIconDefinition();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateIconDefinition(): void {
    if (this.iconComponent) {
      let icon: IconDefinition = this.sortIcon;
      if (this.sort.predicate === this.jhiSortBy) {
        icon = this.sort.ascending ? this.sortAscIcon : this.sortDescIcon;
      }
      this.iconComponent.icon = icon.iconName;
      this.iconComponent.render();
    }
  }
}
