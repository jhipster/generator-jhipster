import { ParamMap } from '@angular/router';

export interface IFilterOptions {
  containsSameOption(option: IFilterOption): unknown;
  filterOptions: IFilterOption[];
  hasAnyFilterSet(): boolean;
  clear(): void;
  removeByName(name: string): void;
  initializeFromParams(params: ParamMap): boolean;
  equals(other: IFilterOptions): boolean;
  clone(): IFilterOptions;
}

export interface IFilterOption {
  name: string;
  value: string | null;
  isSet(): boolean;
  nameAsQueryParam(): string;
}

export interface IFilterableComponent {
  clearFilter(filterName: string): void;
  clearAllFilters(): void;
}

export class FilterOption implements IFilterOption {
  constructor(public name: string, public value: string | null) {}

  nameAsQueryParam(): string {
    return 'filter[' + this.name + ']';
  }

  isSet(): boolean {
    return this.value != null && this.value.length > 0;
  }
}

export class FilterOptions implements IFilterOptions {
  filterOptions: IFilterOption[] = [];

  hasAnyFilterSet(): boolean {
    return this.filterOptions.length > 0 && this.filterOptions.every(e => e.isSet());
  }

  clear(): void {
    this.filterOptions = [];
  }

  add(option: IFilterOption): void {
    this.filterOptions.push(option);
  }

  removeByName(name: string): void {
    this.filterOptions = this.filterOptions.filter(option => option.name !== name);
  }

  equals(other: IFilterOptions): boolean {
    return (
      this.filterOptions.every(thisOption => other.containsSameOption(thisOption)) &&
      other.filterOptions.every(otherOption => this.containsSameOption(otherOption))
    );
  }

  clone(): IFilterOptions {
    const newObject: FilterOptions = new FilterOptions();

    this.filterOptions.forEach(option => {
      newObject.add(new FilterOption(option.name, option.value));
    });

    return newObject;
  }

  initializeFromParams(params: ParamMap): boolean {
    const oldFilters: IFilterOptions = this.clone();

    this.clear();

    const filterRegex = /filter\[(.+)\]/;
    params.keys
      .filter(paramKey => filterRegex.test(paramKey))
      .forEach(matchingParam => {
        const matches = matchingParam.match(filterRegex);
        if (matches && matches.length > 1) {
          this.add(new FilterOption(matches[1], params.get(matchingParam)));
        }
      });

    return !oldFilters.equals(this);
  }

  containsSameOption(optionToSearch: IFilterOption): boolean {
    return this.filterOptions.some(option => option.name === optionToSearch.name && option.value === optionToSearch.value);
  }
}
