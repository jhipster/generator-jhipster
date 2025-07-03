import { Component, computed, input } from '@angular/core';
import TranslateDirective from '../language/translate.directive';

/**
 * A component that will take care of item count statistics of a pagination.
 */
@Component({
  selector: 'jhi-item-count',
  template: ` <div jhiTranslate="global.item-count" [translateValues]="{ first: first(), second: second(), total: total() }"></div> `,
  imports: [TranslateDirective],
})
export default class ItemCountComponent {
  /**
   * @param params  Contains parameters for component:
   *                    page          Current page number
   *                    totalItems    Total number of items
   *                    itemsPerPage  Number of items per page
   */
  params = input<{
    page?: number;
    totalItems?: number;
    itemsPerPage?: number;
  }>();

  first = computed(() => {
    const params = this.params();
    if (params?.page && params.totalItems !== undefined && params.itemsPerPage) {
      return (params.page - 1) * params.itemsPerPage + 1;
    }
    return undefined;
  });

  second = computed(() => {
    const params = this.params();
    if (params?.page && params.totalItems !== undefined && params.itemsPerPage) {
      return params.page * params.itemsPerPage < params.totalItems ? params.page * params.itemsPerPage : params.totalItems;
    }
    return undefined;
  });

  total = computed(() => this.params()?.totalItems);
}
