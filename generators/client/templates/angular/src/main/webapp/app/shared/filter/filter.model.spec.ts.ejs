import { convertToParamMap, ParamMap, Params } from '@angular/router';
import { FilterOptions, IFilterOptions } from './filter.model';

describe('FilterModel Tests', () => {
  const oneValidParam: Params = {
    test: 'blub',
    'filter[hello.in]': 'world',
    'filter[invalid': 'invalid',
    filter_invalid2: 'invalid',
  };

  const noValidParam: Params = {
    test: 'blub',
    'filter[invalid': 'invalid',
    filter_invalid2: 'invalid',
  };

  it('should parse from Params if there are any', () => {
    const filters: IFilterOptions = new FilterOptions();

    const paramMap: ParamMap = convertToParamMap(oneValidParam);

    filters.initializeFromParams(paramMap);

    expect(filters.hasAnyFilterSet()).toBeTruthy();

    expect(filters.filterOptions[0].name).toBe('hello.in');
    expect(filters.filterOptions[0].value).toBe('world');
  });

  it('should parse from Params and have none if there are none', () => {
    const filters: IFilterOptions = new FilterOptions();

    const paramMap: ParamMap = convertToParamMap(noValidParam);

    filters.initializeFromParams(paramMap);

    expect(filters.hasAnyFilterSet()).toBeFalsy();
  });
});
