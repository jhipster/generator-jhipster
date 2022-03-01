import { Directive, EventEmitter, Input, Output } from '@angular/core';

@Directive({
  selector: '[jhiSort]',
})
export class SortDirective<T> {
  @Input()
  get predicate(): T | undefined {
    return this._predicate;
  }
  set predicate(predicate: T | undefined) {
    this._predicate = predicate;
    this.predicateChange.emit(predicate);
  }

  @Input()
  get ascending(): boolean | undefined {
    return this._ascending;
  }
  set ascending(ascending: boolean | undefined) {
    this._ascending = ascending;
    this.ascendingChange.emit(ascending);
  }

  @Output() predicateChange = new EventEmitter<T>();
  @Output() ascendingChange = new EventEmitter<boolean>();
  @Output() sortChange = new EventEmitter<{ predicate: T; ascending: boolean }>();

  private _predicate?: T;
  private _ascending?: boolean;

  sort(field: T): void {
    this.ascending = field !== this.predicate ? true : !this.ascending;
    this.predicate = field;
    this.predicateChange.emit(field);
    this.ascendingChange.emit(this.ascending);
    this.sortChange.emit({ predicate: this.predicate, ascending: this.ascending });
  }
}
