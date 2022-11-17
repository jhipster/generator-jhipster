import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SortService {
  private collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
  });

  public startSort(property: string, order: number): (a: any, b: any) => number {
    return (a: any, b: any) => this.collator.compare(a[property], b[property]) * order;
  }
}
