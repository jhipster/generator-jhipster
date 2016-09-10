import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
    transform(input: Array<any>, filterValue: string, field: string): any {
        return input.filter(val => {
            return val[field].indexOf(filterValue) >= 0;
        });
    }
}
