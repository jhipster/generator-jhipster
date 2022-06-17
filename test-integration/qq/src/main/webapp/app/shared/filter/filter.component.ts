import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IFilterableComponent, IFilterOptions } from './filter.model';

@Component({
  selector: 'jhi-filter',
  templateUrl: './filter.component.html',
})
export class FilterComponent implements IFilterableComponent {
  @Input()
  filters!: IFilterOptions;

  @Output() filterChange = new EventEmitter<IFilterOptions>();

  clearAllFilters(): void {
    this.filters.clear();
    this.filterChange.emit();
  }

  clearFilter(filterName: string): void {
    this.filters.removeByName(filterName);
    this.filterChange.emit();
  }
}
